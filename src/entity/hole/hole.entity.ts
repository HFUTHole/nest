import { User } from '@/entity/user/user.entity'
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { Comment } from '@/entity/hole/comment.entity'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote } from '@/entity/hole/vote.entity'

@Entity()
export class Hole extends AutoIncIdEntity {
  @Column('text', { comment: '文章' })
  body: string

  @Column({
    comment: '树洞图片',
    type: 'simple-array',
  })
  imgs: string[]

  @Column({
    comment: '点赞数',
    default: 0,
  })
  favoriteCounts: number

  @OneToMany(() => Comment, (comment) => comment.hole)
  comments: Comment[]

  @ManyToOne(() => User, (user) => user.holes)
  user: User

  @ManyToMany(() => User, (user) => user.favoriteHole)
  favoriteUsers: User[]

  @ManyToMany(() => Tags, (tags) => tags.holes, { eager: true, cascade: true })
  @JoinTable()
  tags: Tags[]

  @OneToMany(() => Vote, (vote) => vote.hole, { cascade: true })
  votes: Vote[]
}
