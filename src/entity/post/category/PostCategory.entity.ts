import { Column, Entity, OneToMany, Unique } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Post } from '@/entity/post/post.entity'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'

@Entity({ name: 'post_category' })
export class PostCategoryEntity extends CommonEntity {
  @Column({
    comment: '名字',
    unique: true,
  })
  name: string

  @Column({
    comment: '介绍',
    type: 'text',
  })
  description: string

  @Column({
    comment: '背景图片',
    type: 'text',
  })
  bgUrl: string

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[]
}
