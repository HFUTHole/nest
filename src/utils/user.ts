import { AppConfig } from '@/app.config'
import { User } from '@/entity/user/user.entity'

export const getAvatarUrl = (config: AppConfig, user: User) =>
  `${config.user.avatar}?seed=${user.username}`
