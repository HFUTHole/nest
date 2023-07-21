import { NotifyEventType } from '@/common/enums/notify/notify.enum'
import { IUser } from '@/app'

export interface CreateInteractionNotifyInterface {
  type: NotifyEventType
  recipientId: number
  body: string
  reqUser: IUser
  holeId?: number
  commentId?: string
  replyId?: string
}

export interface CreateSystemNotifyInterface {
  userId: number
  title: string
  body: string
}
