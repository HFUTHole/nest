// import { ConflictException, Inject, Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { User } from '@/entity/user/user.entity'
// import { FindOneOptions, In, Repository } from 'typeorm'
// import { createResponse } from '@/utils/create'
// import { IProcessLikeOptions, ILikeableEntity } from '@/modules/post/post.types'
// import {
//   GetPostDetailQuery,
//   GetPostListQuery,
//   PostListMode,
// } from '@/modules/post/dto/post.dto'
// import { Vote } from '@/entity/post/vote.entity'
// import { VoteItem } from '@/entity/post/VoteItem.entity'
// import { IUser } from '@/app'
// import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
// import { initPostDateSelect, resolvePaginationPostData } from '@/modules/post/post.utils'
// import { Post } from '@/entity/post/post.entity'
// import { AppConfig } from '@/app.config'
// import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
// import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
// import { NotifyService } from '@/modules/notify/notify.service'
// import { CreateInteractionNotifyInterface } from '@/modules/notify/interface/params.interface'
// import { NotifyEventType } from '@/common/enums/notify/notify.enum'
//
// // TODO 解决any类型
// @Injectable()
// export class PostRepoService {
//   @InjectRepository(User)
//   private readonly userRepo: Repository<User>
//
//   @InjectRepository(Vote)
//   private readonly voteRepo: Repository<Vote>
//
//   @InjectRepository(VoteItem)
//   private readonly voteItemRepo: Repository<VoteItem>
//
//   @InjectRepository(Post)
//   private readonly postRepo: Repository<Post>
//
//   @InjectRepository(NotifySystemEntity)
//   private readonly notifySystemRepo: Repository<NotifySystemEntity>
//
//   @InjectRepository(NotifyInteractionEntity)
//   private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>
//
//   @Inject()
//   private readonly notifyService: NotifyService
//
//   constructor(private readonly appConfig: AppConfig) {}
//
//   async processLike<T extends ILikeableEntity>({
//     dto,
//     reqUser,
//     repo,
//     propertyPath,
//     entity,
//     type,
//     notifyProps,
//     target: notifyTarget,
//   }: IProcessLikeOptions<T> & {
//     type: string
//     notifyProps?: Pick<
//       CreateInteractionNotifyInterface,
//       'postId' | 'commentId' | 'replyId'
//     >
//   }) {
//     const isLiked = await repo.findOne({
//       relations: {
//         favoriteUsers: true,
//       },
//       where: {
//         id: dto.id,
//         favoriteUsers: {
//           id: reqUser.id,
//         },
//       },
//     } as FindOneOptions<T>)
//
//     if (isLiked?.favoriteUsers?.length) {
//       throw new ConflictException('你已经点赞过了')
//     }
//
//     const user = await this.userRepo.findOne({
//       where: { studentId: reqUser.studentId },
//       relations: { favoriteComment: true },
//     })
//
//     const target = await repo.findOne({
//       relations: {
//         user: true,
//       },
//       select: {
//         user: {
//           username: true,
//           studentId: true,
//         },
//       },
//       where: {
//         id: dto.id,
//       },
//     } as FindOneOptions<T>)
//
//     await this.userRepo
//       .createQueryBuilder()
//       .relation(User, propertyPath as string)
//       .of(user)
//       .add(target)
//
//     await repo
//       .createQueryBuilder()
//       .update(entity as any)
//       .set({ favoriteCounts: () => 'favoriteCounts + 1' } as any)
//       .where('id = :id', { id: dto.id })
//       .execute()
//
//     if (reqUser.studentId !== target.user.studentId) {
//       await this.notifyService.createInteractionNotify({
//         type: NotifyEventType.like,
//         reqUser,
//         body: `${user.username} 赞了你的${type}`,
//         recipientId: target.user.studentId,
//         ...notifyProps,
//         target: notifyTarget,
//       })
//     }
//
//     return createResponse('点赞成功')
//   }
//
//   async processDeleteLike<T extends ILikeableEntity>({
//     dto,
//     reqUser,
//     repo,
//     propertyPath,
//     entity,
//     target: notifyTarget,
//   }: IProcessLikeOptions<T>) {
//     const target = await repo.findOne({
//       relations: {
//         favoriteUsers: true,
//       },
//       where: {
//         id: dto.id,
//         favoriteUsers: {
//           studentId: reqUser.studentId,
//         },
//       },
//     } as FindOneOptions<T>)
//
//     if (!target) {
//       throw new ConflictException('你还没有点赞哦')
//     }
//
//     const user = await this.userRepo.findOne({
//       where: { studentId: reqUser.studentId },
//       relations: { favoriteComment: true },
//     })
//
//     await this.userRepo
//       .createQueryBuilder()
//       .relation(User, propertyPath)
//       .of(user)
//       .remove(target)
//
//     await repo
//       .createQueryBuilder()
//       .update(entity as any)
//       .set({ favoriteCounts: () => 'favoriteCounts - 1' } as any)
//       .where('id = :id', { id: dto.id })
//       .execute()
//
//     return createResponse('取消点赞成功')
//   }
//
//   async findVote(dto: GetPostDetailQuery, reqUser: IUser) {
//     const vote = await this.voteRepo
//       .createQueryBuilder('vote')
//       .setFindOptions({
//         where: {
//           post: {
//             id: dto.id,
//           },
//         },
//       })
//       .leftJoinAndSelect('vote.items', 'voteItems')
//       .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
//         qb.andWhere('isVoted.studentId = :studentId', {
//           studentId: reqUser.studentId,
//         }),
//       )
//       .getOne()
//
//     if (!vote) {
//       return null
//     }
//
//     const voteItems = await this.voteItemRepo
//       .createQueryBuilder('item')
//       .setFindOptions({
//         where: {
//           vote: {
//             id: vote.id,
//           },
//         },
//       })
//       .loadRelationCountAndMap('item.isVoted', 'item.user', 'isVoted', (qb) =>
//         qb.andWhere('isVoted.studentId = :studentId', {
//           studentId: reqUser.studentId,
//         }),
//       )
//       .getMany()
//
//     const totalCount = voteItems.map((item) => item.count).reduce((a, b) => a + b, 0)
//     vote.totalCount = totalCount
//     vote.items = voteItems
//     vote.isExpired = new Date(vote.endTime) < new Date()
//
//     return vote
//   }
//
//   async getList(
//     query: GetPostListQuery,
//     reqUser: IUser,
//     options: {
//       follow?: boolean
//       tag?: {
//         body: string
//       }
//     } = {},
//   ) {
//     // TODO: isVoted bug
//     const queryBuilder = this.postRepo.createQueryBuilder('post').setFindOptions({
//       where: {
//         isHidden: false,
//       },
//       take: query.limit,
//       skip: query.limit * (query.page - 1),
//     })
//
//    .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
//         qb.andWhere('isVoted.studentId = :studentId', {
//           studentId: reqUser.studentId,
//         }),
//       )
//       .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
//         qb.andWhere('isVoted.studentId = :studentId', {
//           studentId: reqUser.studentId,
//         }),
//       )
//       .loadRelationCountAndMap('post.isLiked', 'post.favoriteUsers', 'isLiked', (qb) =>
//         qb.andWhere('isLiked.id = :id', {
//           id: reqUser.id,
//         }),
//       )
//
//     if (options.follow) {
//       const user = await this.userRepo.findOne({
//         relations: {
//           following: true,
//         },
//         where: {
//           id: reqUser.id,
//         },
//       })
//
//       const userId = user.following.map((item) => item.id)
//
//       queryBuilder.setFindOptions({
//         where: {
//           user: {
//             id: In(userId),
//           },
//         },
//         order: {
//           comments: {
//             favoriteCounts: 'desc',
//           },
//         },
//       })
//     }
//
//     if (options.tag) {
//       queryBuilder.setFindOptions({
//         relations: {
//           tags: true,
//         },
//         where: {
//           tags: {
//             body: In([options.tag.body]),
//           },
//         },
//         order: {
//           comments: {
//             favoriteCounts: 'desc',
//           },
//         },
//       })
//     }
//
//     if (!options.tag && !options.follow) {
//       // 修复  table name "post__post_comments" specified more than once
//       queryBuilder.setFindOptions({
//         order: {
//           comments: {
//             favoriteCounts: 'desc',
//           },
//         },
//       })
//     }
//
//     if (query.category) {
//       queryBuilder.where('category.category = :category', {
//         category: query.category,
//       })
//     }
//
//     if (query.mode === PostListMode.hot) {
//       queryBuilder
//         .addSelect(`LOG10(RAND(post.id)) * RAND() * 100`, 'score')
//         .orderBy('score', 'DESC')
//     } else if (query.mode === PostListMode.latest) {
//       queryBuilder.orderBy('post.updateAt', 'DESC')
//     }
//
//     if (query.mode === PostListMode.latest) {
//       queryBuilder.orderBy('post.updateAt', 'DESC')
//     }
//
//     const [data, count] = await queryBuilder.getManyAndCount()
//
//     const ids = data.map((item) => item.id)
//
//     const isLikedPosts = (
//       (
//         await this.userRepo.findOne({
//           relations: {
//             favoritePost: true,
//           },
//           where: {
//             id: reqUser.id,
//             favoritePost: {
//               id: In(ids),
//             },
//           },
//         })
//       )?.favoritePost || []
//     ).map((item) => item.id)
//
//
//
//     // const data = await paginate(queryBuilder, {
//     //   ...query,
//     //   paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
//     // })
//
//     // TODO 用sql解决，还是得多学学sql啊
//     // resolvePaginationPostData(data, this.appConfig)
//
//     const items = data.map((item) => {
//       return {
//         ...item,
//         isLiked: isLikedPosts.includes(item.id),
//       }
//     })
//
//     return {
//       items,
//       meta: {
//         totalItems: count,
//       },
//     }
//   }
// }
import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOneOptions, In, Repository } from 'typeorm'
import { createResponse } from '@/utils/create'
import { ILikeableEntity, IProcessLikeOptions } from '@/modules/post/post.types'
import {
  GetPostDetailQuery,
  GetPostListQuery,
  PostListMode,
} from '@/modules/post/dto/post.dto'
import { Vote } from '@/entity/post/vote.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { IUser } from '@/app'
import { initPostDateSelect, resolvePaginationPostData } from '@/modules/post/post.utils'
import { Post } from '@/entity/post/post.entity'
import { AppConfig } from '@/app.config'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { CreateInteractionNotifyInterface } from '@/modules/notify/interface/params.interface'
import { NotifyEventType } from '@/common/enums/notify/notify.enum'
import { Comment } from '@/entity/post/comment.entity'

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

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(private readonly appConfig: AppConfig) {}

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

  async getList(
    query: GetPostListQuery,
    reqUser: IUser,
    options: {
      follow?: boolean
      tag?: {
        body: string
      }
    } = {},
  ) {
    // TODO: isVoted bug
    const queryBuilder = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.favoriteUsers', 'favoriteUser')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.vote', 'vote')
      .leftJoinAndSelect('vote.items', 'voteItems')
      .setFindOptions({
        relations: {
          comments: {
            user: true,
          },
        },
        where: {
          isHidden: false,
        },
        take: query.limit,
        skip: query.limit * (query.page - 1),
        order: {
          createAt: 'desc',
        },
      })
      .loadRelationCountAndMap('post.isLiked', 'post.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.id = :id', {
          id: reqUser.id,
        }),
      )

    if (options.follow) {
      const user = await this.userRepo.findOne({
        relations: {
          following: true,
        },
        where: {
          id: reqUser.id,
        },
      })

      const userId = user.following.map((item) => item.id)

      // 加0是为了让userId数组不为空，为空会报错，不为会查出所有数据，所以给0可以避免这种情况
      queryBuilder.andWhere('user.id IN (:...userId)', { userId: [0, ...userId] })
    }

    if (options.tag) {
      queryBuilder.setFindOptions({
        relations: {
          tags: true,
        },
        where: {
          tags: {
            body: In([options.tag.body]),
          },
        },
      })
    }

    const [data, totalItems] = await queryBuilder.getManyAndCount()

    const vote = data.map((item) => item.vote).filter(Boolean)

    const userVotes = await this.userRepo.findOne({
      relations: {
        votes: true,
        voteItems: true,
      },
      where: [
        {
          id: reqUser.id,
        },
        {
          votes: {
            id: In(vote.map((item) => item.id)),
          },
        },
        {
          voteItems: {
            id: In(vote.map((item) => item.items.map((i) => i.id)).flat()),
          },
        },
      ],
    })

    const isUserVoted = userVotes?.votes.map((item) => item.id) || []
    const isVoteItemsVoted = userVotes?.voteItems.map((item) => item.id) || []

    const result = {
      items: data.map((post) => {
        return {
          ...post,
          ...(post.vote && {
            vote: {
              ...post.vote,
              isVoted: isUserVoted.includes(post.vote.id),
              items: post.vote.items.map((i) => ({
                ...i,
                isVoted: isVoteItemsVoted.includes(i.id),
              })),
            },
          }),
        }
      }),
      meta: {
        totalItems,
        currentPage: query.page,
        itemsPerPage: query.limit,
        itemCount: data.length,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    }

    resolvePaginationPostData(result as any, this.appConfig)
    return result
  }
}
