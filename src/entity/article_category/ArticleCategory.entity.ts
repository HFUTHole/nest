import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
import { Hole } from '@/entity/hole/hole.entity'

@Entity()
export class ArticleCategory extends CommonEntity {
  @Column({
    type: 'enum',
    enum: ArticleCategoryEnum,
    default: ArticleCategoryEnum.hfutLife,
  })
  category: ArticleCategoryEnum

  @OneToMany(() => Hole, (hole) => hole.category)
  holes: Hole[]
}
