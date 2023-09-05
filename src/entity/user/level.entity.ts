import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CommonEntity } from '@/common/entity/common.entity'

@Entity()
export class UserLevelEntity extends CommonEntity {
  @Column({
    type: 'smallint',
    comment: '等级',
  })
  level: number

  @Column({
    type: 'int',
    comment: '下一次升级所需经验',
  })
  nextLevelRequiredExperience: number

  @Column({
    type: 'int',
    comment: '经验',
  })
  experience: number

  @OneToOne(() => User, (user) => user.level)
  user: User
}
