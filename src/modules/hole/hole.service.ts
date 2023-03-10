import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm'
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
import { GetRepliesQuery } from '@/modules/hole/dto/replies.dto'

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

  @InjectEntityManager()
  private readonly manager: EntityManager

  async getList(query: PaginateQuery) {
    return paginate<Hole>(this.holeRepo, query, {
      relations: {
        user: true,
      },
    })
  }

  async delete(body: DeleteHoleDto, reqUser: IUser) {}

  async getDetail(query: GetHoleDetailQuery) {
    return this.holeRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: query.id,
      },
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

    const hole = await this.holeRepo.findOneBy({ id: dto.id })

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

    user.favoriteHole.splice(isAlreadyLikedIndex, 1)

    await this.userRepo.save(user)

    return createResponse('取消点赞成功')
  }

  async create(dto: CreateHoleDto, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const hole = this.holeRepo.create({
      user,
      ...dto,
    })

    await this.holeRepo.save(hole)

    return createResponse('创建树洞成功')
  }

  async createComment(dto: CreateCommentDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOneBy({ id: dto.id })
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const comment = this.commentRepo.create({
      body: dto.body,
      hole,
      user,
    })

    await this.commentRepo.save(comment)

    return createResponse('留言成功')
  }

  async getComment(dto: GetHoleCommentDto) {
    return paginate<Comment>(
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
  }

  async replyComment(dto: CreateCommentReplyDto, reqUser: IUser) {
    const comment = await this.commentRepo.findOne({
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

    await this.replyRepo.save(reply)

    return createResponse('回复成功')
  }

  async getReplies(query: GetRepliesQuery, user: IUser) {
    return paginate<Reply>(
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
  }
}
