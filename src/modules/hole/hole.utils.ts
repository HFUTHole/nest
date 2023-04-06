import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Hole } from '@/entity/hole/hole.entity'
import { getAvatarUrl } from '@/utils/user'
import { AppConfig } from '@/app.config'

export const resolvePaginationHoleData = (
  data: Pagination<Hole, IPaginationMeta>,
  config: AppConfig,
) => {
  ;(data.items as any) = data.items.map((item) => {
    if (!item.user.avatar) {
      item.user.avatar = getAvatarUrl(config, item.user)
    }
    return {
      ...item,
      comments: item.comments.slice(0, 2),
      body: `${item.body.slice(0, 300)}${item.body.length > 300 ? '...' : ''}`,
      commentsCount: item.comments.length,
      voteTotalCount: item.votes.reduce((prev, cur) => prev + cur.count, 0),
    }
  })
}
