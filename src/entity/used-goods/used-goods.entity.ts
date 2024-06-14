import { CommonEntity } from '@/common/entity/common.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { User } from '@/entity/user/user.entity'
import { UsedGoodsStatusEnum } from '@/common/enums/used-goods/use-goods-status.enum'
import { Comment } from '@/entity/post/comment.entity'

@Entity()
export class UsedGoodsEntity extends CommonEntity {
  @Index({
    fulltext: true,
  })
  @Column('text', { comment: '商品内容' })
  body: string

  @Column({
    comment: '浏览量',
    default: 0,
  })
  views: number

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
    comment: '点赞数',
    default: 0,
  })
  collectorCounts: number

  @Column({
    comment: '商品状态',
    type: 'enum',
    enum: UsedGoodsStatusEnum,
    default: UsedGoodsStatusEnum.ok,
  })
  status: UsedGoodsStatusEnum

  @Column({
    comment: '图片',
    type: 'simple-array',
  })
  imgs: string[]

  // 二手商品被多少人收藏
  @ManyToMany(() => User, (user) => user.collectedUsedGoods)
  collector: User[]

  @ManyToOne(() => UsedGoodsCategoryEntity, (category) => category.goods, {
    cascade: true,
  })
  @JoinColumn()
  category: UsedGoodsCategoryEntity

  @ManyToOne(() => User, (user) => user.usedGoods, { cascade: true })
  creator: User

  @OneToMany(() => Comment, (comment) => comment.goods)
  comments: Comment[]

  // virtual column
  readonly isCollected: boolean

  readonly commentsCount: number
}
