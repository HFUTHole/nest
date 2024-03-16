// import { Injectable } from '@nestjs/common'
// import { InjectRepository } from '@nestjs/typeorm'
// import { Post } from '@/entity/post/post.entity'
// import { Repository } from 'typeorm'
// import { ArticleCategory } from '@/entity/article_category/ArticleCategory.entity'
// import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
//
// //TODO: 改成定时任务
// @Injectable()
// export class CategoryNullScript {
//   constructor(
//     @InjectRepository(Post)
//     private readonly postRepo: Repository<Post>,
//
//     @InjectRepository(ArticleCategory)
//     private readonly articleCategoryRepo: Repository<ArticleCategory>,
//   ) {
//     // this.run()
//   }
//
//   async run() {
//     const posts = await this.postRepo.find({
//       relations: {
//         category: true,
//       },
//       where: {
//         category: null,
//       },
//     })
//
//     for (const post of posts) {
//       post.category = this.articleCategoryRepo.create({
//         category: ArticleCategoryEnum.hfutLife,
//       })
//     }
//
//     await this.postRepo.save(posts)
//   }
// }
