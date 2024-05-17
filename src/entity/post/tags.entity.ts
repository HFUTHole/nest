import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Post } from '@/entity/post/post.entity'
import { User } from '@/entity/user/user.entity'

@Entity()
export class Tags extends CommonEntity {
  @Column()
  body: string

  @Column({
    default: '',
    type: 'text',
    comment: '描述',
  })
  desc: string

  @Column({
    default: 0,
    type: 'int',
    comment: '浏览量',
  })
  views: number

  @OneToMany(() => User, (user) => user.collectedTags)
  collectedUsers: User[]

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[]

  readonly isCollected?: boolean
}
