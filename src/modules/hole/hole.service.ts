import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { EntityManager, Like, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CreateHoleDto } from '@/modules/hole/dto/create.dto'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { paginate } from 'nestjs-typeorm-paginate'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetHoleCommentDto,
} from '@/modules/hole/dto/comment.dto'
import { Comment } from '@/entity/hole/comment.entity'
import {
  DeleteHoleDto,
  GetHoleDetailQuery,
  GetHoleListQuery,
  HoleListMode,
} from '@/modules/hole/dto/hole.dto'
import { Reply } from '@/entity/hole/reply.entity'
import { GetRepliesQuery, ReplyReplyDto } from '@/modules/hole/dto/replies.dto'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote, VoteType } from '@/entity/hole/vote.entity'
import { PostVoteDto } from '@/modules/hole/dto/vote.dto'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyEvent } from '@/entity/notify/notify.entity'
import { AppConfig } from '@/app.config'
import { getAvatarUrl } from '@/utils/user'
import { HoleDetailCommentMode } from '@/modules/hole/hole.constant'
import { SearchQuery } from '@/modules/hole/dto/search.dto'
import { resolvePaginationHoleData } from '@/modules/hole/hole.utils'

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

  constructor(private readonly appConfig: AppConfig) {}

  async getList(query: GetHoleListQuery) {
    let queryBuilder = this.holeRepo.createQueryBuilder('hole').setFindOptions({
      relations: {
        user: true,
        votes: true,
        comments: true,
      },
    })

    if (query.mode === HoleListMode.random) {
      queryBuilder = queryBuilder
        .addSelect('LOG10(hole.favoriteCounts + 2) * RAND() * 5', 'score')
        .orderBy('score', 'DESC')
    } else if (query.mode === HoleListMode.timeline) {
      queryBuilder = queryBuilder.orderBy('hole.createAt', 'DESC')
    }

    const data = await paginate(queryBuilder, query)

    // TODO 用sql解决，还是得多学学sql啊
    resolvePaginationHoleData(data, this.appConfig)

    return data
  }

  async delete(body: DeleteHoleDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      where: { id: body.id },
      select: { user: { studentId: true } },
    })

    if (hole.user.studentId !== reqUser.studentId) {
      throw new ForbiddenException('这不是你的树洞哦')
    }

    await this.holeRepo.delete({ id: hole.id })

    return createResponse('删除成功')
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
      throw new ForbiddenException('参数错误')
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
          throw new ConflictException('你已经投过票了')
        } else {
          await appendVotedUser()
        }
      }
    }

    await this.holeRepo.save(hole)

    return createResponse('投票成功')
  }

  async getDetail(query: GetHoleDetailQuery, reqUser: IUser) {
    const data = await this.holeRepo.findOne({
      relations: {
        user: true,
        votes: true,
        favoriteUsers: true,
      },
      where: {
        id: query.id,
      },
      select: {
        favoriteUsers: { studentId: true },
      },
    })

    const isLiked = !!data.favoriteUsers.find(
      (item) => item.studentId === reqUser.studentId,
    )

    delete data.favoriteUsers

    // TODO 用sql解决
    return createResponse('获取树洞详情成功', {
      ...data,
      isLiked,
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
      throw new ConflictException('你已经点赞过了')
    }

    const hole = await this.holeRepo.findOne({
      relations: {
        user: true,
      },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })

    await this.manager.transaction(async (transactionalEntityManager) => {
      hole.favoriteCounts++

      user.favoriteHole.push(hole)

      await this.notifyService.notify(
        NotifyEvent.like,
        '有一个人点赞了你的树洞',
        reqUser.studentId,
        hole.id,
        transactionalEntityManager,
      )

      await transactionalEntityManager.save(user)
    })

    return createResponse('点赞成功')
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
      throw new NotFoundException('你还没有点赞过哦')
    }

    const hole = await this.holeRepo.findOne({ where: { id: dto.id } })

    hole.favoriteCounts--
    user.favoriteHole.splice(isAlreadyLikedIndex, 1)

    await this.manager.transaction(async (transactionManager) => {
      await transactionManager.getRepository(User).save(user)
      await transactionManager.getRepository(Hole).save(hole)
    })

    return createResponse('取消点赞成功')
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

    return createResponse('创建树洞成功', { id: hole.id })
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
        `有人评论了你的树洞#${hole.id}`,
        hole.user.studentId,
        hole.id,
        transactionalEntityManager,
      )
    })

    return createResponse('留言成功')
  }

  async getComment(dto: GetHoleCommentDto) {
    const hole = await this.holeRepo.findOne({
      relations: {
        user: true,
      },
      select: {
        user: {
          studentId: true,
        },
      },
      where: { id: dto.id },
    })

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
          ...(dto.mode === HoleDetailCommentMode.author && {
            user: { studentId: hole.user.studentId },
          }),
        },
      },
    )

    return createResponse('获取评论成功', data)
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
        `有人给你的评论#${comment.id}回复了哦`,
        comment.user.studentId,
        comment.id,
        transactionalEntityManager,
      )
    })

    return createResponse('回复成功')
  }

  async replyReply(dto: ReplyReplyDto, reqUser: IUser) {
    return createResponse('成功')
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

    return createResponse('获取回复成功', data)
  }

  async search(query: SearchQuery) {
    const { keywords, ...paginationQuery } = query

    const data = await paginate(this.holeRepo, paginationQuery, {
      relations: {
        user: true,
        votes: true,
        comments: true,
      },
      where: {
        body: Like(`%${keywords}%`),
      },
      order: {
        createAt: 'DESC',
      },
    })

    resolvePaginationHoleData(data, this.appConfig)

    return createResponse('查询成功', data)
  }
}
