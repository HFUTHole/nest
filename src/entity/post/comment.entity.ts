import { CommonEntity } from '@/common/entity/common.entity'
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
import { Post } from '@/entity/post/post.entity'
import { User } from '@/entity/user/user.entity'
import { Reply } from '@/entity/post/reply.entity'
import { Report } from '@/entity/report/report.entity'

@Entity()
export class Comment extends CommonEntity {
  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '留言内容' })
  body: string

  @ManyToOne(() => Post, (post) => post.comments, { cascade: true })
  post: Post

  @ManyToOne(() => User, (user) => user.comments, { cascade: true })
  user: User

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[]

  @Column({
    comment: '点赞数',
    default: 0,
  })
  @Index()
  favoriteCounts: number

  @Column({
    comment: '图片',
    type: 'simple-array',
  })
  imgs: string[]

  @ManyToMany(() => User, (user) => user.favoriteComment)
  favoriteUsers: User[]

  @OneToMany(() => Report, (report) => report.comment)
  reports: Report[]

  @AfterUpdate()
  async afterLoad() {
    this.favoriteCounts = this.favoriteUsers?.length
  }

  // TODO use @VirtualMapColumn() WIP...
  repliesCount?: number

  isNotification?: boolean
}
