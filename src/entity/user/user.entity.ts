import { Column, Entity, Index, OneToMany } from 'typeorm'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Exclude } from 'class-transformer'

export enum Gender {
  Male = '男',
  Female = '女',
}

@Entity()
export class User extends AutoIncIdEntity {
  @Index()
  @Column({ comment: '学号' })
  @Exclude()
  studentId: number

  @Index()
  @Column({ comment: '用户名' })
  username: string

  @Column({ comment: '密码' })
  @Exclude()
  password: string

  @Column({ comment: '信息门户密码' })
  @Exclude()
  hfutPassword: string

  @Column({
    comment: '性别',
    type: 'enum',
    enum: Gender,
  })
  @Exclude()
  gender: Gender

  @OneToMany(() => Hole, (hole) => hole.user, { cascade: true })
  holes: Hole[]
}
