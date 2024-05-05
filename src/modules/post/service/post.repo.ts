import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { createResponse } from '@/utils/create'
import { IProcessLikeOptions, ILikeableEntity } from '@/modules/post/post.types'
import {
  GetPostDetailQuery,
  GetPostListQuery,
  PostListMode,
} from '@/modules/post/dto/post.dto'
import { Vote } from '@/entity/post/vote.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { IUser } from '@/app'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { initPostDateSelect, resolvePaginationPostData } from '@/modules/post/post.utils'
import { Post } from '@/entity/post/post.entity'
import { AppConfig } from '@/app.config'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { CreateInteractionNotifyInterface } from '@/modules/notify/interface/params.interface'
import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { PrismaService } from 'nestjs-prisma'

// TODO 解决any类型
@Injectable()
export class PostRepoService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  @InjectRepository(VoteItem)
  private readonly voteItemRepo: Repository<VoteItem>

  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(
    private readonly appConfig: AppConfig,
    private readonly prisma: PrismaService,
  ) {}

  async processLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
    entity,
    type,
    notifyProps,
    target: notifyTarget,
  }: IProcessLikeOptions<T> & {
    type: string
    notifyProps?: Pick<
      CreateInteractionNotifyInterface,
      'postId' | 'commentId' | 'replyId'
    >
  }) {
    const isLiked = await repo.findOne({
      relations: {
        favoriteUsers: true,
      },
      where: {
        id: dto.id,
        favoriteUsers: {
          id: reqUser.id,
        },
      },
    } as FindOneOptions<T>)

    if (isLiked?.favoriteUsers?.length) {
      throw new ConflictException('你已经点赞过了')
    }

    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
      relations: { favoriteComment: true },
    })

    const target = await repo.findOne({
      relations: {
        user: true,
      },
      select: {
        user: {
          username: true,
          studentId: true,
        },
      },
      where: {
        id: dto.id,
      },
    } as FindOneOptions<T>)

    await this.userRepo
      .createQueryBuilder()
      .relation(User, propertyPath as string)
      .of(user)
      .add(target)

    await repo
      .createQueryBuilder()
      .update(entity as any)
      .set({ favoriteCounts: () => 'favoriteCounts + 1' } as any)
      .where('id = :id', { id: dto.id })
      .execute()

    if (reqUser.studentId !== target.user.studentId) {
      await this.notifyService.createInteractionNotify({
        type: NotifyEventType.like,
        reqUser,
        body: `${user.username} 赞了你的${type}`,
        recipientId: target.user.studentId,
        ...notifyProps,
        target: notifyTarget,
      })
    }

    return createResponse('点赞成功')
  }

  async processDeleteLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
    entity,
    target: notifyTarget,
  }: IProcessLikeOptions<T>) {
    const target = await repo.findOne({
      relations: {
        favoriteUsers: true,
      },
      where: {
        id: dto.id,
        favoriteUsers: {
          studentId: reqUser.studentId,
        },
      },
    } as FindOneOptions<T>)

    if (!target) {
      throw new ConflictException('你还没有点赞哦')
    }

    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
      relations: { favoriteComment: true },
    })

    await this.userRepo
      .createQueryBuilder()
      .relation(User, propertyPath)
      .of(user)
      .remove(target)

    await repo
      .createQueryBuilder()
      .update(entity as any)
      .set({ favoriteCounts: () => 'favoriteCounts - 1' } as any)
      .where('id = :id', { id: dto.id })
      .execute()

    return createResponse('取消点赞成功')
  }

  async findVote(dto: GetPostDetailQuery, reqUser: IUser) {
    const vote = await this.voteRepo
      .createQueryBuilder('vote')
      .setFindOptions({
        where: {
          post: {
            id: dto.id,
          },
        },
      })
      .leftJoinAndSelect('vote.items', 'voteItems')
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .getOne()

    if (!vote) {
      return null
    }

    const voteItems = await this.voteItemRepo
      .createQueryBuilder('item')
      .setFindOptions({
        where: {
          vote: {
            id: vote.id,
          },
        },
      })
      .loadRelationCountAndMap('item.isVoted', 'item.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .getMany()

    const totalCount = voteItems.map((item) => item.count).reduce((a, b) => a + b, 0)
    vote.totalCount = totalCount
    vote.items = voteItems
    vote.isExpired = new Date(vote.endTime) < new Date()

    return vote
  }

  async getList(query: GetPostListQuery, reqUser: IUser) {
    const queryBuilder = initPostDateSelect(this.postRepo)
      .setFindOptions({
        select: {
          user: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      })
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
      .loadRelationCountAndMap('post.isLiked', 'post.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.id = :id', {
          id: reqUser.id,
        }),
      )

    if (query.category) {
      queryBuilder.where('category.category = :category', {
        category: query.category,
      })
    }

    if (query.mode === PostListMode.hot) {
      queryBuilder
        .addSelect(`LOG10(RAND(post.id)) * RAND() * 100`, 'score')
        .orderBy('score', 'DESC')
    } else if (query.mode === PostListMode.latest) {
      queryBuilder.orderBy('post.createAt', 'DESC')
    }

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    // TODO 用sql解决，还是得多学学sql啊
    resolvePaginationPostData(data, this.appConfig)

    return data
  }
}
