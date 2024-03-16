import { Column, Entity, ManyToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Post } from '@/entity/post/post.entity'

@Entity()
export class Tags extends CommonEntity {
  @Column()
  body: string

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[]
}
