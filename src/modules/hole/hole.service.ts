import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { EntityManager, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CreateHoleDto } from '@/modules/hole/dto/create.dto'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { paginate } from 'nestjs-typeorm-paginate'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetHoleCommentDto,
} from '@/modules/hole/dto/comment.dto'
import { Comment } from '@/entity/hole/comment.entity'
import { DeleteHoleDto, GetHoleDetailQuery } from '@/modules/hole/dto/hole.dto'
import { Reply } from '@/entity/hole/reply.entity'
import { GetRepliesQuery, ReplyReplyDto } from '@/modules/hole/dto/replies.dto'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote, VoteType } from '@/entity/hole/vote.entity'
import { PostVoteDto } from '@/modules/hole/dto/vote.dto'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyEvent } from '@/entity/notify/notify.entity'

@Injectable()
export class HoleService {
  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  @InjectRepository(Tags)
  private readonly tagsRepo: Repository<Tags>

  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  @InjectEntityManager()
  private readonly manager: EntityManager

  @Inject()
  private readonly notifyService: NotifyService

  async getList(query: PaginateQuery) {
    const data = await paginate<Hole>(this.holeRepo, query, {
      relations: {
        user: true,
        votes: true,
      },
    })

    // TODO ???sql???????????????????????????sql???
    ;(data.items as any) = data.items.map((item) => {
      return {
        ...item,
        body: `${item.body.slice(1, 500)}...`,
        totalCount: item.votes.reduce((prev, cur) => prev + cur.count, 0),
      }
    })

    return data
  }

  async delete(body: DeleteHoleDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      where: { id: body.id },
      select: { user: { studentId: true } },
    })

    if (hole.user.studentId !== reqUser.studentId) {
      throw new ForbiddenException('????????????????????????')
    }

    await this.holeRepo.delete({ id: hole.id })

    return createResponse('????????????')
  }

  async getTags() {
    return this.tagsRepo.find({
      relations: {
        holes: true,
      },
      where: { holes: { id: 5 } },
    })
  }

  async vote(dto: PostVoteDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: {
        user: true,
        votes: { user: true },
      },
      select: {
        user: { studentId: true },
        votes: {
          id: true,
          user: { studentId: true },
        },
      },
      where: { id: dto.id },
    })

    const votes = hole.votes.filter((vote) => dto.ids.includes(vote.id as string))

    if (votes.length !== dto.ids.length) {
      throw new ForbiddenException('????????????')
    }

    const type: VoteType = votes[0].type

    for (const vote of votes) {
      const appendVotedUser = async () => {
        const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })
        vote.user.push(user)
        vote.count++
      }

      if (type === VoteType.multiple) {
        const isAlreadyVoted = Boolean(
          vote.user.find((item) => item.studentId === reqUser.studentId),
        )

        if (!isAlreadyVoted) {
          await appendVotedUser()
        }
      } else {
        const isAlreadyVoted = Boolean(
          votes.find((vote) =>
            vote.user.find((user) => user.studentId === reqUser.studentId),
          ),
        )

        if (isAlreadyVoted) {
          throw new ConflictException('?????????????????????')
        } else {
          await appendVotedUser()
        }
      }
    }

    await this.holeRepo.save(hole)

    return createResponse('????????????')
  }

  async getDetail(query: GetHoleDetailQuery) {
    const data = await this.holeRepo.findOne({
      relations: {
        user: true,
        votes: true,
      },
      where: {
        id: query.id,
      },
    })

    // TODO ???sql??????
    return createResponse('????????????????????????', {
      ...data,
      voteTotalCount: data.votes.reduce((prev, cur) => prev + cur.count, 0),
    })
  }

  async likeHole(dto: GetHoleDetailQuery, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      relations: {
        favoriteHole: true,
      },
      where: {
        studentId: reqUser.studentId,
      },
    })

    if (!user.favoriteHole) {
      user.favoriteHole = []
    }

    const isAlreadyLiked = user.favoriteHole.find((item) => item.id === dto.id)

    if (isAlreadyLiked) {
      throw new ConflictException('?????????????????????')
    }

    const hole = await this.holeRepo.findOne({
      relations: {
        user: true,
      },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })

    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .getRepository(Hole)
        .createQueryBuilder()
        .update(Hole)
        .set({
          favoriteCounts: () => 'favoriteCounts + 1',
        })
        .where('id = :id', { id: dto.id })
        .execute()

      user.favoriteHole.push(hole)

      await this.notifyService.notify(
        NotifyEvent.like,
        '?????????????????????????????????',
        reqUser.studentId,
        hole.id,
        transactionalEntityManager,
      )

      await transactionalEntityManager.save(user)
    })

    return createResponse('????????????')
  }

  async deleteLike(dto: GetHoleDetailQuery, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      relations: {
        favoriteHole: true,
      },
      where: {
        studentId: reqUser.studentId,
      },
    })

    const isAlreadyLikedIndex = user.favoriteHole?.findIndex((item) => item.id === dto.id)

    if (isAlreadyLikedIndex === -1) {
      throw new NotFoundException('????????????????????????')
    }

    user.favoriteHole.splice(isAlreadyLikedIndex, 1)

    await this.userRepo.save(user)

    return createResponse('??????????????????')
  }

  async create(dto: CreateHoleDto, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const tags = dto.tags.map((tag) =>
      this.tagsRepo.create({
        body: tag,
      }),
    )

    const votes = dto.votes.map((vote) =>
      this.voteRepo.create({
        option: vote,
        type: dto.isMultipleVote ? VoteType.multiple : VoteType.single,
      }),
    )

    const hole = this.holeRepo.create({
      user,
      body: dto.body,
      imgs: dto.imgs,
      tags,
      votes,
    })

    await this.holeRepo.save(hole)

    return createResponse('??????????????????')
  }

  async createComment(dto: CreateCommentDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const comment = this.commentRepo.create({
      body: dto.body,
      hole,
      user,
    })

    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.getRepository(Comment).save(comment)
      await this.notifyService.notify(
        NotifyEvent.comment,
        `???????????????????????????#${hole.id}`,
        hole.user.studentId,
        hole.id,
        transactionalEntityManager,
      )
    })

    return createResponse('????????????')
  }

  async getComment(dto: GetHoleCommentDto) {
    const data = await paginate<Comment>(
      this.commentRepo,
      {
        limit: dto.limit,
        page: dto.page,
      },
      {
        relations: { user: true, replies: { user: true } },
        order: {
          createAt: 'asc',
          replies: {
            createAt: 'asc',
          },
        },
        where: {
          hole: { id: dto.id },
        },
      },
    )

    return createResponse('??????????????????', data)
  }

  async replyComment(dto: CreateCommentReplyDto, reqUser: IUser) {
    const comment = await this.commentRepo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id: dto.commentId },
    })

    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const reply = this.replyRepo.create({
      comment,
      body: dto.body,
      user,
    })

    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.getRepository(Reply).save(reply)
      await this.notifyService.notify(
        NotifyEvent.reply,
        `?????????????????????#${comment.id}????????????`,
        comment.user.studentId,
        comment.id,
        transactionalEntityManager,
      )
    })

    return createResponse('????????????')
  }

  async replyReply(dto: ReplyReplyDto, reqUser: IUser) {
    return createResponse('??????')
  }

  async getReplies(query: GetRepliesQuery, user: IUser) {
    const data = paginate<Reply>(
      this.replyRepo,
      {
        limit: query.limit,
        page: query.page,
      },
      {
        relations: {
          user: true,
        },
      },
    )

    return createResponse('??????????????????', data)
  }
}
