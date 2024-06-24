import { Inject, Injectable } from '@nestjs/common'
import { CreateCommentDto, GetPostCommentDto } from '@/modules/post/dto/comment.dto'
import { IUser } from '@/app'
import { Limit } from '@/constants/limit'
import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { ellipsisBody } from '@/utils/string'
import { createResponse } from '@/utils/create'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Post } from '@/entity/post/post.entity'
import { EntityManager, FindOptionsOrder, Not, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { Tags } from '@/entity/post/tags.entity'
import { Vote } from '@/entity/post/vote.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { PostRepoService } from '@/modules/post/service/post.repo'
import { RoleService } from '@/modules/role/role.service'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import {
  GoodsCreateCommentDto,
  GoodsGetCommentDto,
} from '@/modules/used-goods/dto/comment.dto'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { PostService } from '@/modules/post/service/post.service'
import {
  PostDetailCommentMode,
  PostDetailCommentOrderMode,
} from '@/modules/post/post.constant'
import { addCommentIsLiked, resolveEntityImgUrl } from '@/modules/post/post.utils'
import { paginate } from 'nestjs-typeorm-paginate'
import * as _ from 'lodash'
import { AppConfig } from '@/app.config'
import { GetUsedGoodsDetailQuery } from '@/modules/used-goods/dto/detail.dto'
import { UsedGoodsSearchQuery } from '@/modules/used-goods/dto/search.dto'

@Injectable()
export class UsedGoodsCommentService {
  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  @InjectRepository(UsedGoodsEntity)
  private readonly goodsRepo: Repository<UsedGoodsEntity>

  @Inject()
  private readonly postService: PostService

  constructor(private readonly appConfig: AppConfig) {}

  async createComment(dto: GoodsCreateCommentDto, reqUser: IUser, ip: string) {
    const goods = await this.goodsRepo.findOne({
      relations: { creator: true },
      select: { creator: { studentId: true, id: true, username: true } },
      where: { id: dto.id },
    })

    const comment = await this.postService._createComment(dto, reqUser, {
      goods,
      ip,
    })

    return createResponse('留言成功', {
      ...comment,
      incExperience: Limit.level.comment,
    })
  }

  async getComment(dto: GoodsGetCommentDto, reqUser: IUser) {
    const goods = await this.goodsRepo.findOne({
      relations: {
        creator: true,
      },
      select: {
        creator: {
          studentId: true,
        },
      },
      where: { id: dto.id },
    })

    const isFavoriteOrder = dto.order === PostDetailCommentOrderMode.favorite

    const order: FindOptionsOrder<Comment> = {
      ...(isFavoriteOrder ? { favoriteCounts: 'DESC' } : { createAt: 'DESC' }),
    }

    const commentQuery = this.commentRepo
      .createQueryBuilder('comment')
      .setFindOptions({
        relations: { user: true, replies: { user: true, replyUser: true } },
        order: {
          ...order,
          replies: {
            favoriteCounts: 'DESC',
          },
        },
        where: {
          goods: { id: dto.id },
          ...(dto.mode === PostDetailCommentMode.author && {
            user: { studentId: goods.creator.studentId },
          }),
          ...(dto.commentId && { id: Not(dto.commentId) }),
        },
        select: {
          user: {
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('comment.repliesCount', 'comment.replies')

    addCommentIsLiked(commentQuery, reqUser)

    const data = await paginate<Comment>(commentQuery, {
      limit: dto.limit,
      page: dto.page,
    })

    if (dto.commentId && dto.page === 1) {
      const commentBuilder = this.commentRepo
        .createQueryBuilder('comment')
        .setFindOptions({
          relations: { user: true, replies: { user: true } },
          where: {
            id: dto.commentId,
          },
        })
        .loadRelationCountAndMap('comment.repliesCount', 'comment.replies')

      addCommentIsLiked(commentBuilder, reqUser)

      const comment = await commentBuilder.getOne()

      // 标明为从通知模块点击来的评论
      comment.isNotification = true

      data.items.unshift(comment)
    }

    let reply: Reply | undefined = undefined
    let parentReply: Reply | undefined = undefined

    if (dto.replyId) {
      reply = await this.replyRepo.findOne({
        where: {
          id: dto.replyId,
        },
        relations: {
          parentReply: true,
          user: true,
        },
        select: {
          user: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      })

      parentReply = await this.replyRepo.findOne({
        where: {
          id: reply?.parentReply?.id,
        },
        relations: {
          parentReply: true,
          user: true,
        },
        select: {
          user: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      })
    }

    // TODO use queryBuilder to solve this problem
    ;(data as any).items = data.items.map((item) => {
      item.replies = item.replies.slice(0, 1)

      // comment imgs
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 50,
      })

      // comment replies imgs
      item.replies.forEach((reply) =>
        resolveEntityImgUrl(this.appConfig, reply, {
          quality: 50,
        }),
      )

      if (item.id === dto.commentId) {
        const items = [parentReply, reply].filter(Boolean)

        const isReplyRepeated = [reply?.id, parentReply?.id]?.includes(
          item.replies[0]?.id,
        )
        if (!isReplyRepeated) {
          items.push(item.replies[0])
        }
        item.replies.unshift(...items)
      }

      item.replies = _.uniqWith(item.replies, _.isEqual)

      return item
    })

    return createResponse('获取评论成功', {
      ...data,
      incExperience: Limit.level.comment,
    })
  }
}
