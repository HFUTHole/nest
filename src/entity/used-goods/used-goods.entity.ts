import { CommonEntity } from '@/common/entity/common.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { User } from '@/entity/user/user.entity'

@Entity()
export class UsedGoodsEntity extends CommonEntity {
  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '商品内容' })
  body: string

  @Column({
    comment: '价格',
    type: 'float',
  })
  price: number

  @Column({
    comment: '校区',
  })
  area: string

  @Column({
    comment: '图片',
    type: 'simple-array',
  })
  imgs: string[]

  @ManyToMany(() => User, (user) => user.collectedUsedGoods)
  collector: User[]

  @ManyToOne(() => UsedGoodsCategoryEntity, (category) => category.goods, {
    cascade: true,
  })
  @JoinColumn()
  category: UsedGoodsCategoryEntity

  @ManyToOne(() => User, (user) => user.usedGoods, { cascade: true })
  creator: User
}
