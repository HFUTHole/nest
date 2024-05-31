import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, OneToMany, OneToOne } from 'typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'

@Entity()
export class UsedGoodsCategoryEntity extends CommonEntity {
  @Column({
    comment: '分类名',
  })
  name: string

  @OneToMany(() => UsedGoodsEntity, (goods) => goods.category)
  goods: UsedGoodsEntity
}
