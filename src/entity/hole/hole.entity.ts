import { User } from '@/entity/user/user.entity'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Comment } from '@/entity/hole/comment.entity'
import { AutoIncIdEntity } from '@/common/entity/common.entity'

@Entity()
export class Hole extends AutoIncIdEntity {
  @Column({
    comment: '树洞文本内容',
  })
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
}
