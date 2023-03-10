import { Column, Entity, Index, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Exclude } from 'class-transformer'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Role } from '@/modules/role/role.constant'

export enum Gender {
  Male = '男',
  Female = '女',
}

@Entity()
export class User extends AutoIncIdEntity {
  @Index()
  @Column({ comment: '学号', select: false })
  studentId: number

  @Index()
  @Column({ comment: '用户名' })
  username: string

  @Column({ comment: '密码', select: false })
  password: string

  @Column({ comment: '信息门户密码', select: false })
  hfutPassword: string

  @Column({
    comment: '性别',
    type: 'enum',
    enum: Gender,
    select: false,
  })
  gender: Gender

  @Column({
    comment: '角色权限',
    type: 'enum',
    enum: Role,
    select: false,
    default: Role.User,
  })
  role: Role

  @OneToMany(() => Hole, (hole) => hole.user, { cascade: true })
  holes: Hole[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[]

  @ManyToMany(() => Hole, (hole) => hole.favoriteUsers, { cascade: true })
  @JoinTable()
  favoriteHole: Hole[]
}
