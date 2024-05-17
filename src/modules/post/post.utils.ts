import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Post } from '@/entity/post/post.entity'
import { getAvatarUrl } from '@/utils/user'
import { AppConfig } from '@/app.config'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { IUser } from '@/app'
import { Comment } from '@/entity/post/comment.entity'
import { Vote } from '@/entity/post/vote.entity'
import { User } from '@/entity/user/user.entity'
import { Reply } from '@/entity/post/reply.entity'

export const resolvePaginationPostData = (
  data: Pagination<Post, IPaginationMeta>,
  config: AppConfig,
) => {
  ;(data.items as any) = data.items.map((item) => {
    if (item.user) {
      // 隐藏用户id
      item.user = {
        id: item.user.id,
        username: item.user.username,
        avatar: item.user.avatar,
      } as User
    }

    if (!item.user.avatar) {
      item.user.avatar = getAvatarUrl(config, item.user)
    }

    if (item.vote) {
      item.vote.totalCount = item.vote.items.reduce((prev, cur) => prev + cur.count, 0)
      item.vote.isExpired = isVoteExpired(item.vote)
    }

    // 隐藏评论用户id
    if (item.comments.length) {
      item.comments = item.comments.map((comment) => {
        comment.user = {
          id: comment.user.id,
          username: comment.user.username,
          avatar: comment.user.avatar,
        } as User

        return comment
      })
    }

    return {
      ...item,
      comments: item.comments.slice(0, 2),
      body: `${item.body.slice(0, 150)}${item.body.length > 150 ? '...' : ''}`,
      commentCounts: item.comments.length,
    }
  })
}

export const addCommentIsLiked = (query: SelectQueryBuilder<Comment>, reqUser: IUser) => {
  query.loadRelationCountAndMap(
    'comment.isLiked',
    'comment.favoriteUsers',
    'isLiked',
    (qb) =>
      qb.andWhere('isLiked.studentId = :studentId', {
        studentId: reqUser.studentId,
      }),
  )
}

export const addReplyIsLiked = (query: SelectQueryBuilder<Reply>, reqUser: IUser) => {
  query.loadRelationCountAndMap('reply.isLiked', 'reply.favoriteUsers', 'isLiked', (qb) =>
    qb.andWhere('isLiked.studentId = :studentId', {
      studentId: reqUser.studentId,
    }),
  )
}

export const isVoteExpired = (vote: Vote) => {
  return false
}

export const initPostDateSelect = (postRepo: Repository<Post>) =>
  postRepo
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('post.favoriteUsers', 'favoriteUser')
    .leftJoinAndSelect('post.tags', 'tags')
    .leftJoinAndSelect('post.vote', 'vote')
    .leftJoinAndSelect('vote.items', 'voteItems')
    .leftJoinAndSelect('post.comments', 'comments')
    .leftJoinAndSelect('comments.user', 'comment.user')
