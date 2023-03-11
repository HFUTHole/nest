import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { User } from '@/entity/user/user.entity'

export enum VoteType {
  single = 'single',

  multiple = 'multiple',
}

@Entity()
export class Vote extends CommonEntity {
  @Column({
    comment: '选项',
    type: 'text',
  })
  option: string

  @Column({
    comment: '投票数',
    default: 0,
  })
  count: number

  @Column({
    comment: '类型',
    type: 'enum',
    enum: VoteType,
    default: VoteType.single,
  })
  type: VoteType

  @ManyToOne(() => Hole, (hole) => hole.votes)
  hole: Hole

  @ManyToMany(() => User, (user) => user.votes, { cascade: true })
  @JoinTable()
  user: User[]
}
