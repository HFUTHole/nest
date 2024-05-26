import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common'
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
import { EditProfileDto, GetUserOtherProfileDto } from '@/modules/user/dtos/profile.dto'
import { resolvePaginationCommentData } from '@/modules/user/user.utils'
import { UserFollowDto } from '@/modules/user/dtos/follow.dto'
import { GetUserPostsQuery } from '@/modules/user/dtos/post.dto'
import { generateImgProxyUrl } from '@/utils/imgproxy'

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

  async getOtherUserProfile(query: GetUserOtherProfileDto) {
    console.log(query)
    const data = await this.userRepository.findOne({
      relations: {
        level: true,
      },
      where: {
        id: query.userId,
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

    const avatar = generateImgProxyUrl(this.appConfig, dto.avatar, {
      quality: 60,
    })

    await this.userRepository.update(
      {
        studentId: reqUser.studentId,
      },
      {
        ...dto,
        avatar,
      },
    )

    return createResponse('修改个人信息成功')
  }

  async getFavoritePosts(query: GetUserPostsQuery, reqUser: IUser) {
    const isUserIdExist = query.userId

    const queryBuilder = initPostDateSelect(this.postRepo)
      .where('favoriteUser.id = :userId', { userId: query.userId || reqUser.id })
      .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.id = :userId', {
          userId: query.userId || reqUser.id,
        }),
      )
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.id = :userId', {
          userId: query.userId || reqUser.id,
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

  async getPostList(query: GetUserPostsQuery, reqUser: IUser) {
    const queryBuilder = initPostDateSelect(this.postRepo)
      .where('user.id = :id', { id: query.userId || reqUser.id })
      .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.id = :id', {
          id: query.userId || reqUser.id,
        }),
      )
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.id = :id', {
          id: query.userId || reqUser.id,
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

  async follow(dto: UserFollowDto, reqUser: IUser) {
    if (dto.userId === reqUser.id) {
      throw new ConflictException('不能关注自己哦')
    }

    const existingFollow = await this.userRepository.findOne({
      where: {
        id: reqUser.id,
        following: {
          id: dto.userId,
        },
      },
    })

    if (existingFollow) {
      throw new ConflictException('已经关注过了')
    }

    const user = await this.userRepository.findOne({
      relations: {
        following: true,
        followers: true,
      },
      where: {
        id: reqUser.id,
      },
    })

    if (!user.following) {
      user.following = []
    }

    if (!user.followers) {
      user.followers = []
    }

    user.following.push(
      this.userRepository.create({
        id: dto.userId,
      }),
    )

    // 创建关注关系
    await this.userRepository.save(user)

    return createResponse('关注成功')
  }

  async unFollow(dto: UserFollowDto, reqUser: IUser) {
    if (dto.userId === reqUser.id) {
      throw new ConflictException('不能取关自己哦')
    }

    const existingFollow = await this.userRepository.findOne({
      relations: { followers: true, following: true },
      where: {
        id: reqUser.id,
        following: {
          id: dto.userId,
        },
      },
    })

    if (!existingFollow) {
      throw new ConflictException('还没有关注过哦')
    }

    const idx = existingFollow.following.findIndex((item) => item.id === dto.userId)!
    existingFollow.following.splice(idx, 1)

    await this.userRepository.save(existingFollow)

    return createResponse('取关成功')
  }

  async isFollowed(dto: UserFollowDto, reqUser: IUser) {
    const existingFollow = await this.userRepository.findOne({
      where: {
        id: reqUser.id,
        following: {
          id: dto.userId,
        },
      },
    })

    return createResponse('获取是否关注成功', {
      isFollowed: Boolean(existingFollow),
    })
  }
}
