import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { Vote } from '@/entity/hole/vote.entity'

@Entity()
export class VoteItem extends CommonEntity {
  @OneToMany(() => User, (user) => user.voteItems)
  user: User[]

  @Column()
  option: string

  @ManyToOne(() => Vote, (vote) => vote.items)
  vote: Vote
}
