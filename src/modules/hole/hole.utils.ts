import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Hole } from '@/entity/hole/hole.entity'
import { getAvatarUrl } from '@/utils/user'
import { AppConfig } from '@/app.config'
import { SelectQueryBuilder } from 'typeorm'
import { IUser } from '@/app'
import { Comment } from '@/entity/hole/comment.entity'
import { Vote } from '@/entity/hole/vote.entity'
import { User } from '@/entity/user/user.entity'

export const resolvePaginationHoleData = (
  data: Pagination<Hole, IPaginationMeta>,
  config: AppConfig,
) => {
  ;(data.items as any) = data.items.map((item) => {
    if (item.user) {
      // 隐藏用户id
      item.user = {
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
          username: comment.user.username,
          avatar: comment.user.avatar,
        } as User

        return comment
      })
    }

    return {
      ...item,
      comments: item.comments.slice(0, 2),
      body: ellipsisBody(item.body, 300),
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

export const isVoteExpired = (vote: Vote) => {
  return false
}

export const ellipsisBody = (str: string, len: number) => {
  return `${str.slice(0, len)}${str.length > len ? '...' : ''}`
}
