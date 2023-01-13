import { CommonEntity } from '@/common/entity/common.entity'
import { User } from '@/entity/user/user.entity'
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Hole extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne((type) => User, (user) => user.hole_list)
  user: User
}
