import { Column, Entity, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { HoleSubCategoryEntity } from '@/entity/hole/category/HoleSubCategory.entity'

@Entity({ name: 'hole_category' })
export class HoleCategoryEntity extends CommonEntity {
  @Column({
    comment: '名字',
  })
  name: string

  @Column({
    comment: '介绍',
    type: 'mediumtext',
  })
  description: string

  @Column({
    comment: '背景图片',
    type: 'text',
  })
  bgUrl: string

  @OneToMany(() => Hole, (hole) => hole.classification)
  holes: Hole[]

  @OneToMany(() => HoleSubCategoryEntity, (category) => category.category, {
    cascade: true,
  })
  children: HoleSubCategoryEntity[]
}
