import { Column, Entity, Index, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Exclude } from 'class-transformer'
import { Comment } from '@/entity/hole/comment.entity'

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
  password: string

  @Column({ comment: '信息门户密码' })
  hfutPassword: string

  @Column({
    comment: '性别',
    type: 'enum',
    enum: Gender,
  })
  gender: Gender

  @OneToMany(() => Hole, (hole) => hole.user, { cascade: true })
  holes: Hole[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]

  @ManyToMany(() => Hole, (hole) => hole.favoriteUsers, { cascade: true })
  @JoinTable()
  favoriteHole: Hole[]
}
