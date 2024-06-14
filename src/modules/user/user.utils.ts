import { ellipsisBody } from '@/utils/string'
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Comment } from '@/entity/post/comment.entity'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'

export const resolvePaginationCommentData = (
  data: Pagination<Comment, IPaginationMeta>,
) => {
  data.items.forEach((item) => {
    item.body = ellipsisBody(item.body, 30)

    item.user = {
      username: item.user.username,
      avatar: item.user.avatar,
    } as User
  })
}
