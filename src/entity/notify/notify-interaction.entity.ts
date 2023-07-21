import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { NotifyEventType, NotifyStatus } from '@/common/enums/notify/notify.enum'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'

@Entity({ name: 'notify_interaction' })
export class NotifyInteractionEntity extends CommonEntity {
  @Column({
    type: 'boolean',
    comment: '是否已读',
    default: false,
  })
  isRead: boolean

  @Column({
    type: 'enum',
    enum: NotifyEventType,
    comment: '通知事件',
  })
  type: NotifyEventType

  @Column({
    comment: '通知内容',
  })
  body: string

  @ManyToOne(() => User)
  creator: User

  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => Hole)
  hole: Hole

  @ManyToOne(() => Comment)
  comment: Comment

  @ManyToOne(() => Reply)
  reply: Reply
}
