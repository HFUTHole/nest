import { CommonEntity } from '@/common/entity/common.entity'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Column, Entity, Index, ManyToOne, ManyToMany, JoinTable } from 'typeorm'

@Entity()
export class ExpressEmoji extends CommonEntity {
  @Index({
    fulltext: true,
  })
  @Column({
    comment: '表情字符串',
  })
  emoji: string

  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  @ManyToOne(() => Hole, (hole) => hole.expressEmojis)
  hole: Hole

  @ManyToOne(() => Comment, (comment) => comment.expressEmojis)
  comment: Comment

  @ManyToOne(() => Reply, (reply) => reply.expressEmojis)
  reply: Reply
}
