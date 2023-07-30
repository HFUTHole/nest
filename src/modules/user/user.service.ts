import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { createResponse } from '@/utils/create'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { PaginationTypeEnum, paginate } from 'nestjs-typeorm-paginate'
import { AppConfig } from '@/app.config'
import { resolvePaginationHoleData, initHoleDateSelect } from '@/modules/hole/hole.utils'
import { resolvePaginationCommentData } from '@/modules/user/user.utils'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(private readonly appConfig: AppConfig) {}

  async getProfile(reqUser: IUser) {
    const data = await this.userRepository.findOne({
      where: {
        studentId: reqUser.studentId,
      },
      select: {
        role: true,
        avatar: true,
        username: true,
      },
    })

    return createResponse('获取用户信息成功', data)
  }

  async getFavoriteHoles(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = initHoleDateSelect(this.holeRepo)
      .where('favoriteUser.studentId = :studentId', { studentId: reqUser.studentId })
      .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .orderBy('hole.createAt', 'DESC')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    resolvePaginationHoleData(data, this.appConfig)

    return createResponse('获取用户点赞树洞成功', data)
  }

  async getHoleList(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = initHoleDateSelect(this.holeRepo)
      .where('user.studentId = :studentId', { studentId: reqUser.studentId })
      .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .orderBy('hole.createAt', 'DESC')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    resolvePaginationHoleData(data, this.appConfig)

    return createResponse('获取用户树洞成功', data)
  }

  async getComments(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.hole', 'hole')
      .where('user.studentId = :studentId', { studentId: reqUser.studentId })
      .orderBy('comment.createAt', 'DESC')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    resolvePaginationCommentData(data)

    return createResponse('获取用户评论成功', data)
  }
}
