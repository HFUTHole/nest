import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { User } from '@/entity/user/user.entity'

@Entity()
export class Comment extends CommonEntity {
  @Column({ comment: '留言内容' })
  body: string

  @Column({ comment: '点赞数', default: 0 })
  favoriteCount: number

  @ManyToOne(() => Hole, (hole) => hole.comments, { cascade: true })
  hole: Hole

  @ManyToOne(() => User, (user) => user.comments, { cascade: true })
  user: User
}
