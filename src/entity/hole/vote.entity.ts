import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { User } from '@/entity/user/user.entity'
import { VoteItem } from '@/entity/hole/VoteItem.entity'

export enum VoteType {
  single = 'single',

  multiple = 'multiple',
}

@Entity()
export class Vote extends CommonEntity {
  @Column({
    comment: '类型',
    type: 'enum',
    enum: VoteType,
    default: VoteType.single,
  })
  type: VoteType

  @CreateDateColumn({
    type: 'timestamp',
    comment: '投票结束时间',
  })
  endTime: Date

  @OneToOne(() => Hole, (hole) => hole.votes)
  hole: Hole

  @ManyToMany(() => User, (user) => user.votes, { cascade: true })
  @JoinTable()
  user: User[]

  @OneToMany(() => VoteItem, (voteItem) => voteItem.vote)
  items: VoteItem[]
}
