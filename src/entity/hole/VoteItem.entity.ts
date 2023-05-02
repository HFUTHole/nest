import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm'
import { Vote } from '@/entity/hole/vote.entity'
import { User } from '@/entity/user/user.entity'

@Entity()
export class VoteItem extends CommonEntity {
  @Column()
  option: string

  @Column({
    default: 0,
  })
  count: number

  @ManyToOne(() => Vote, (vote) => vote.items)
  vote: Vote

  @ManyToMany(() => User, (user) => user.voteItems)
  user: User[]

  isVoted: number
}
