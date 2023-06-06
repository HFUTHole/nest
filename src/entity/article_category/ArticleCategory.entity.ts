import { Column, Entity, ManyToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
import { Hole } from '@/entity/hole/hole.entity'

@Entity()
export class ArticleCategory extends CommonEntity {
  @Column({
    type: 'enum',
    enum: ArticleCategoryEnum,
  })
  category: ArticleCategoryEnum

  @ManyToMany(() => Hole, (hole) => hole.categories)
  holes: Hole[]
}
