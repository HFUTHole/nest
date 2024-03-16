import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'

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

  @ManyToOne(() => Post)
  post: Post

  @ManyToOne(() => Comment)
  comment: Comment

  @ManyToOne(() => Reply)
  reply: Reply
}
