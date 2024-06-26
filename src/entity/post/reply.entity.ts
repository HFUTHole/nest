import {
  AfterLoad,
  AfterUpdate,
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CommonEntity } from '@/common/entity/common.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Report } from '@/entity/report/report.entity'

@Entity()
export class Reply extends CommonEntity {
  @Index({
    fulltext: true,
  })
  @Column({ comment: '留言内容' })
  body: string

  @Column({
    comment: '图片',
    type: 'simple-array',
  })
  imgs: string[]

  @Column({
    comment: 'IP归属地',
    default: '',
  })
  ip_location: string

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
  @Index()
  favoriteCounts: number

  @ManyToMany(() => User, (user) => user.favoriteReply)
  favoriteUsers: User[]

  @OneToMany(() => Report, (report) => report.reply)
  reports: Report[]

  @AfterUpdate()
  async afterLoad() {
    this.favoriteCounts = this.favoriteUsers?.length
  }

  @ManyToOne(() => User, (user) => user.repliedReply, { cascade: true })
  replyUser: User

  isNotification?: boolean = false
}
