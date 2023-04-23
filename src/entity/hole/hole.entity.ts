import { User } from '@/entity/user/user.entity'
import {
  JoinColumn,
  AfterUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  AfterInsert,
  AfterLoad,
  AfterRemove,
} from 'typeorm'
import { Comment } from '@/entity/hole/comment.entity'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote } from '@/entity/hole/vote.entity'

@Entity()
export class Hole extends AutoIncIdEntity {
  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '文章' })
  body: string

  @Column({
    comment: '树洞图片',
    type: 'simple-array',
  })
  imgs: string[]

  @OneToMany(() => Comment, (comment) => comment.hole)
  comments: Comment[]

  @ManyToOne(() => User, (user) => user.holes)
  user: User

  @ManyToMany(() => Tags, (tags) => tags.holes, { eager: true, cascade: true })
  @JoinTable()
  tags: Tags[]

  @OneToOne(() => Vote, (vote) => vote.hole, { cascade: true, eager: true })
  @JoinColumn()
  vote: Vote

  @Column({
    comment: '点赞数',
    default: 0,
  })
  @Index()
  favoriteCounts: number

  @ManyToMany(() => User, (user) => user.favoriteHole)
  favoriteUsers: User[]

  // Use loadRelationCountAndMap to get whether user liked this hole, it will always return 0 or 1 but you can use it as boolean
  // ref: https://pietrzakadrian.com/blog/virtual-column-solutions-for-typeorm#4-loadrelationcountandmap-method
  readonly isLiked?: number
}
