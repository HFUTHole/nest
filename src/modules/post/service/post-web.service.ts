import { Injectable } from '@nestjs/common'
import { GetPostDetailQuery } from '@/modules/post/dto/post.dto'
import { IUser } from '@/app'
import { addCommentIsLiked, resolveEntityImgUrl } from '@/modules/post/post.utils'
import { createResponse } from '@/utils/create'
import { AppConfig } from '@/app.config'
import { InjectRepository } from '@nestjs/typeorm'
import { Post } from '@/entity/post/post.entity'
import { FindOptionsOrder, Not, Repository } from 'typeorm'
import { GetPostCommentDto } from '@/modules/post/dto/comment.dto'
import {
  PostDetailCommentMode,
  PostDetailCommentOrderMode,
} from '@/modules/post/post.constant'
import { Comment } from '@/entity/post/comment.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { Reply } from '@/entity/post/reply.entity'
import * as _ from 'lodash'
import { Limit } from '@/constants/limit'

@Injectable()
export class PostWebService {
  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  constructor(private readonly appConfig: AppConfig) {}

  async getDetail(query: GetPostDetailQuery) {
    const data = await this.postRepo
      .createQueryBuilder('post')
      .setFindOptions({
        relations: {
          user: true,
        },
        where: {
          id: query.id,
        },
        select: {
          user: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('post.commentCounts', 'post.comments')
      .getOne()

    resolveEntityImgUrl(this.appConfig, data, {
      quality: 70,
    })

    return createResponse('获取树洞详情成功', data as any)
  }

  async getComment(dto: GetPostCommentDto) {
    const post = await this.postRepo.findOne({
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
          post: { id: dto.id },
          ...(dto.mode === PostDetailCommentMode.author && {
            user: { studentId: post.user.studentId },
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
