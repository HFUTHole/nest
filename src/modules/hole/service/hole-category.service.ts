import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { EntityManager, Repository } from 'typeorm'
import { HoleCategoryEntity } from '@/entity/hole/category/HoleCategory.entity'
import { HoleSubCategoryEntity } from '@/entity/hole/category/HoleSubCategory.entity'
import { Category } from '@/constants/category'
import { InjectLogger } from '@/utils/decorator'
import { Logger } from 'winston'
import * as process from 'process'
import { ArticleCategory } from '@/entity/article_category/ArticleCategory.entity'
import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
import { paginate } from 'nestjs-typeorm-paginate'
import { createResponse } from '@/utils/create'

@Injectable()
export class HoleCategoryService {
  @InjectLogger()
  private readonly logger: Logger

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(HoleCategoryEntity)
  private readonly holeCategoryRepo: Repository<HoleCategoryEntity>

  @InjectRepository(HoleSubCategoryEntity)
  private readonly holeSubCategoryRepo: Repository<HoleSubCategoryEntity>

  @InjectRepository(ArticleCategory)
  private readonly articleCategoryRepo: Repository<ArticleCategory>

  @InjectEntityManager()
  private readonly manager: EntityManager

  private _categories: HoleCategoryEntity[] = []
  private _sub: HoleSubCategoryEntity[] = []

  async migrateCategory() {
    const categories = await this.articleCategoryRepo.find({
      relations: {
        holes: true,
      },
    })

    const migrateCategoryToClassification = async (category: ArticleCategory) => {
      const name: string = category.category
      let categoryName = ''
      let subName = ''

      if (name === ArticleCategoryEnum.hfutLife) {
        categoryName = '日常'
        subName = '工大广场'
      } else if (name === ArticleCategoryEnum.cat) {
        categoryName = '小动物'
        subName = '宣'
      } else if (name === ArticleCategoryEnum.lostAndFound) {
        categoryName = '失物招领'
        subName = '宣'
      } else if (name === 'ACG') {
        categoryName = '动漫'
        subName = '动漫交流'
      } else if (name === ArticleCategoryEnum.love) {
        categoryName = '情感分享'
        subName = '你 & Ta的故事'
      } else if (name === ArticleCategoryEnum.study) {
        categoryName = '学在工大'
        subName = '学在工大'
      } else if (name === ArticleCategoryEnum.taoSecondHand) {
        categoryName = '淘二手'
        subName = '宣'
      }

      const categories = await Promise.all(
        (
          await this.holeCategoryRepo.find({
            relations: { holes: true },
            where: {
              name: categoryName,
            },
          })
        ).map(async (item) => {
          if (!item.holes) {
            item.holes = []
          }
          item.holes.push(...category.holes)
          const subCategory = await this.holeSubCategoryRepo.findOne({
            relations: {
              holes: true,
            },
            where: {
              name: subName,
            },
          })

          if (!subCategory.holes) {
            subCategory.holes = []
          }

          subCategory.holes.push(...category.holes)

          this._sub.push(subCategory)

          return item
        }),
      )

      this._categories.push(...categories)
    }

    for (const category of categories) {
      await migrateCategoryToClassification(category)
    }

    await this.manager.transaction(async (t) => {
      await t.getRepository(HoleCategoryEntity).save(this._categories)
      await t.getRepository(HoleSubCategoryEntity).save(this._sub)
    })
  }

  async startMigrate() {
    const promises = Category.map(async (item) => {
      const isAlreadyExist = await this.holeCategoryRepo.findOne({
        where: { name: item.name },
      })

      if (isAlreadyExist) {
        return
      }

      const category = this.holeCategoryRepo.create({
        name: item.name,
        children: item.children?.map((child) =>
          this.holeSubCategoryRepo.create({
            name: child,
          }),
        ),
        description: item.description,
        bgUrl: item.url,
      })

      return this.holeCategoryRepo.save(category)
    })

    const result = await Promise.all(promises)
    this.migrateCategory()

    process.nextTick(() => {
      this.logger.log({
        level: 'log',
        message: `成功创建分类：${result.filter(Boolean).length}个`,
      })
    })
  }

  // async getCategory(query: HoleGetCategoryQuery) {
  //   const categoryQuery = this.holeCategoryRepo
  //     .createQueryBuilder('category')
  //     .leftJoin('category.children', 'children')
  //   // TODO 实现hot
  //   if (query.subCategory === 'latest') {
  //     categoryQuery.setFindOptions({
  //       relations: {
  //         holes: true,
  //       },
  //       order: {
  //         holes: {
  //           createAt: 'desc',
  //         },
  //       },
  //     })
  //   } else {
  //     categoryQuery.setFindOptions({
  //       relations: {
  //         holes: {
  //           user: true,
  //         },
  //       },
  //       where: {
  //         holes: {
  //           subClassification: {
  //             name: query.subCategory,
  //           },
  //         },
  //       },
  //     })
  //   }
  //
  //   const data = await paginate(categoryQuery, {
  //     limit: query.limit,
  //     page: query.page,
  //   })
  //
  //   return createResponse('获取分区成功', data)
  // }
}
