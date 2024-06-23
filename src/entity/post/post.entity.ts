import { User } from '@/entity/user/user.entity'
import {
  JoinColumn,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { Comment } from '@/entity/post/comment.entity'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Tags } from '@/entity/post/tags.entity'
import { Vote } from '@/entity/post/vote.entity'
import { Report } from '@/entity/report/report.entity'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'

@Entity()
export class Post extends AutoIncIdEntity {
  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '文章' })
  body: string

  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '标题', default: null })
  title: string

  @Column({
    comment: '树洞图片',
    type: 'simple-array',
  })
  imgs: string[]

  @Column({
    comment: 'BV号',
    default: null,
  })
  bilibili: string

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[]

  @ManyToOne(() => User, (user) => user.posts)
  user: User

  @ManyToMany(() => Tags, (tags) => tags.posts, { cascade: true })
  @JoinTable()
  tags: Tags[]

  @OneToOne(() => Vote, (vote) => vote.post, { cascade: true, eager: true })
  @JoinColumn()
  vote: Vote

  @Column({
    comment: '点赞数',
    default: 0,
  })
  @Index()
  favoriteCounts: number

  @ManyToMany(() => User, (user) => user.favoritePost)
  favoriteUsers: User[]

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[]

  // Use loadRelationCountAndMap to get whether user liked this post, it will always return 0 or 1 but you can use it as boolean
  // ref: https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm#4-loadrelationcountandmap-method
  readonly isLiked?: number

  readonly commentCounts?: number
}
