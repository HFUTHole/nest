import { Column, Entity, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'

@Entity()
export class NotifyInteractionEntity extends CommonEntity {
  @Column({
    type: 'boolean',
    comment: '是否已读',
    default: false,
  })
  isRead: boolean

  @Column({
    comment: '评论通知',
    nullable: true,
  })
  body?: string

  @Column({
    type: 'enum',
    enum: NotifyEventType,
    comment: '通知事件',
  })
  type: NotifyEventType

  @Column({
    type: 'enum',
    enum: InteractionNotifyTargetType,
  })
  target: InteractionNotifyTargetType

  @ManyToOne(() => User)
  creator: User

  @ManyToOne(() => User)
  user: User

  @ManyToOne(() => Post)
  post: Post

  @ManyToOne(() => Comment)
  comment: Comment

  @ManyToOne(() => Reply)
  reply: Reply

  @ManyToOne(() => UsedGoodsEntity)
  usedGoods: UsedGoodsEntity
}
