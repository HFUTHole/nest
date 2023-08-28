import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { HoleCategoryEntity } from '@/entity/hole/category/HoleCategory.entity'

@Entity({ name: 'hole_sub_category' })
export class HoleSubCategoryEntity extends CommonEntity {
  @Column({
    comment: '名字',
  })
  name: string

  @ManyToOne(() => HoleCategoryEntity, (category) => category.children)
  category: HoleCategoryEntity

  @OneToMany(() => Hole, (hole) => hole.subClassification)
  holes: Hole[]
}
