import { Column, Entity, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { User } from '@/entity/user/user.entity'

export enum NotifyEvent {
  comment = 'comment',
  reply = 'reply',
  like = 'like',
  delete = 'delete',
}

export enum NotifyStatus {
  read,
  unread,
}

@Entity()
export class Notify extends CommonEntity {
  @Column({
    type: 'enum',
    enum: NotifyEvent,
    comment: '通知类型',
  })
  event: NotifyEvent

  @Column('text', {
    comment: '消息',
  })
  message: string

  @Column({
    type: 'enum',
    comment: '状态',
    enum: NotifyStatus,
    default: NotifyStatus.unread,
  })
  status: NotifyStatus

  @ManyToOne(() => User, (user) => user.notifications, { cascade: true })
  user: User
}
