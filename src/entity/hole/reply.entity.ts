import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CommonEntity } from '@/common/entity/common.entity'
import { Comment } from '@/entity/hole/comment.entity'

@Entity()
export class Reply extends CommonEntity {
  @Column({ comment: '留言内容' })
  body: string

  @ManyToOne(() => User, (user) => user.replies, { cascade: true })
  user: User

  @ManyToOne(() => Comment, (comment) => comment.replies, { cascade: true })
  comment: Comment

  @ManyToOne(() => Reply, (reply) => reply.parentReply)
  parentReply: Reply

  @Column({
    comment: '点赞数',
    default: 0,
  })
  favoriteCount: number

  @ManyToOne(() => User, (user) => user.repliedReply, { cascade: true })
  replyUser: User
}
