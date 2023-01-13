import { Column, Entity, Index, JoinTable, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'

export enum Gender {
  Male = '男',
  Female = '女',
}

@Entity()
export class User extends CommonEntity {
  @Index()
  @Column({ comment: '学号' })
  studentId: number

  @Index()
  @Column({ comment: '用户名' })
  username: string

  @Column({ comment: '密码' })
  password: string

  @Column({ comment: '信息门户密码' })
  hfutPassword: string

  @Column({
    comment: '性别',
    type: 'enum',
    enum: Gender,
  })
  gender: Gender

  @JoinTable()
  @OneToMany((type) => Hole, (hole) => hole.user)
  hole_list: Hole[]
}
