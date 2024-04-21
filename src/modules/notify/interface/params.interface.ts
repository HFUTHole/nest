import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { IUser } from '@/app'

export interface CreateInteractionNotifyInterface {
  type: NotifyEventType
  recipientId: number
  target: InteractionNotifyTargetType
  body: string
  reqUser: IUser
  postId?: number
  commentId?: string
  replyId?: string
}

export interface CreateSystemNotifyInterface {
  userId: number
  title: string
  body: string
}
