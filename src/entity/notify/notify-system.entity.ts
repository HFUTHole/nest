import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { NotifyStatus } from '@/common/enums/notify/notify.enum'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'

@Entity({ name: 'notify_system' })
export class NotifySystemEntity extends CommonEntity {
  @Column({
    comment: '标题',
  })
  title: string

  @Column({
    comment: '内容',
  })
  body: string

  @Column({
    type: 'boolean',
    comment: '是否已读',
    default: false,
  })
  isRead: boolean

  @ManyToOne(() => User)
  user: User

  @ManyToMany(() => User)
  @JoinTable()
  completedReadingUsers: User[]

  @ManyToOne(() => Hole)
  hole: Hole

  @ManyToOne(() => Comment)
  comment: Comment

  @ManyToOne(() => Reply)
  reply: Reply
}
