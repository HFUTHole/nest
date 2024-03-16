import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { createResponse } from '@/utils/create'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { PaginationTypeEnum, paginate } from 'nestjs-typeorm-paginate'
import { AppConfig } from '@/app.config'
import { resolvePaginationPostData, initPostDateSelect } from '@/modules/post/post.utils'
import { EditProfileDto } from '@/modules/user/dtos/profile.dto'
import { resolvePaginationCommentData } from '@/modules/user/user.utils'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(private readonly appConfig: AppConfig) {}

  async getProfile(reqUser: IUser) {
    const data = await this.userRepository.findOne({
      relations: {
        level: true,
      },
      where: {
        studentId: reqUser.studentId,
      },
      select: {
        id: true,
        role: true,
        avatar: true,
        username: true,
        level: {
          level: true,
          experience: true,
          nextLevelRequiredExperience: true,
        },
      },
    })

    return createResponse('获取用户信息成功', data)
  }

  async editProfile(dto: EditProfileDto, reqUser: IUser) {
    if (!Object.keys(dto).length) {
      throw new BadRequestException('参数不合法')
    }

    await this.userRepository.update(
      {
        studentId: reqUser.studentId,
      },
      {
        ...dto,
      },
    )

    return createResponse('修改个人信息成功')
  }

  async getFavoritePosts(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = initPostDateSelect(this.postRepo)
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
      .orderBy('post.createAt', 'DESC')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    resolvePaginationPostData(data, this.appConfig)

    return createResponse('获取用户点赞树洞成功', data)
  }

  async getPostList(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = initPostDateSelect(this.postRepo)
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
      .orderBy('post.createAt', 'DESC')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    resolvePaginationPostData(data, this.appConfig)

    return createResponse('获取用户树洞成功', data)
  }

  async getComments(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
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
