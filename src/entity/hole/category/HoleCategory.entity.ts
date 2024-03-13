import { Column, Entity, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'

@Entity({ name: 'hole_category' })
export class HoleCategoryEntity extends CommonEntity {
  @Column({
    comment: '名字',
  })
  name: string

  @Column({
    comment: '介绍',
    type: 'text',
  })
  description: string

  @Column({
    comment: '校区',
    type: 'enum',
    enum: SchoolAreaEnum,
    nullable: true
  })
  area: SchoolAreaEnum

  @Column({
    comment: '背景图片',
    type: 'text',
  })
  bgUrl: string

  @OneToMany(() => Hole, (hole) => hole.classification)
  holes: Hole[]
}
