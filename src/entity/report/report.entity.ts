import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { User } from '@/entity/user/user.entity'

export enum ReportType {
  post = 'post',
  comment = 'comment',
  reply = 'reply',
}

@Entity()
export class Report extends CommonEntity {
  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType

  @Column()
  reason: string

  @ManyToOne(() => Post, (post) => post.reports, { cascade: true })
  post: Post

  @ManyToOne(() => Comment, (comment) => comment.reports, { cascade: true })
  comment: Comment

  @ManyToOne(() => Reply, (reply) => reply.reports, { cascade: true })
  reply: Reply

  @ManyToMany(() => User, (user) => user.reports, { cascade: true })
  @JoinTable()
  user: User[]
}
