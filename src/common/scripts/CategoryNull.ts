// import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { Hole } from '@/entity/hole/hole.entity'
// import { Repository } from 'typeorm'
// import { ArticleCategory } from '@/entity/article_category/ArticleCategory.entity'
// import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
//
// //TODO: 改成定时任务
// @Injectable()
// export class CategoryNullScript {
//   constructor(
//     @InjectRepository(Hole)
//     private readonly holeRepo: Repository<Hole>,
//
//     @InjectRepository(ArticleCategory)
//     private readonly articleCategoryRepo: Repository<ArticleCategory>,
//   ) {
//     // this.run()
//   }
//
//   async run() {
//     const holes = await this.holeRepo.find({
//       relations: {
//         category: true,
//       },
//       where: {
//         category: null,
//       },
//     })
//
//     for (const hole of holes) {
//       hole.category = this.articleCategoryRepo.create({
//         category: ArticleCategoryEnum.hfutLife,
//       })
//     }
//
//     await this.holeRepo.save(holes)
//   }
// }
