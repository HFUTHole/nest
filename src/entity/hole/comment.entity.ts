import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { User } from '@/entity/user/user.entity'
import { Reply } from '@/entity/hole/reply.entity'

@Entity()
export class Comment extends CommonEntity {
  @Column('text', { comment: '留言内容' })
  body: string

  @Column({ comment: '点赞数', default: 0 })
  favoriteCount: number

  @ManyToOne(() => Hole, (hole) => hole.comments, { cascade: true })
  hole: Hole

  @ManyToOne(() => User, (user) => user.comments, { cascade: true })
  user: User

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[]
}
