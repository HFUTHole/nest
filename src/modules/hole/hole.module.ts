import { Module, NestModule } from '@nestjs/common'
import { HoleController } from './hole.controller'
import { HoleService } from './service/hole.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import {
  IsCommentExistConstraint,
  IsCorrectSubCategoryExistConstraint,
  IsHoleExistConstraint,
  IsReplyExistConstraint,
  IsValidPostImgsConstraint,
  IsVoteExistConstraint,
  IsVoteItemExistConstraint,
} from '@/modules/hole/dto/utils.dto'
import { Reply } from '@/entity/hole/reply.entity'
import { RoleService } from '@/modules/role/role.service'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote } from '@/entity/hole/vote.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { HoleRepoService } from '@/modules/hole/service/hole.repo'
import { ArticleCategory } from '@/entity/article_category/ArticleCategory.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { HolePostThrottleGuard } from '@/modules/hole/guard/post-throttle.guard'
import { HoleCategoryService } from '@/modules/hole/service/hole-category.service'
import { HoleCategoryEntity } from '@/entity/hole/category/HoleCategory.entity'
import { HoleSubCategoryEntity } from '@/entity/hole/category/HoleSubCategory.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Hole,
      Comment,
      Reply,
      Tags,
      Vote,
      VoteItem,
      ArticleCategory,
      NotifyInteractionEntity,
      NotifySystemEntity,
      HoleCategoryEntity,
      HoleSubCategoryEntity,
    ]),
  ],
  controllers: [HoleController],
  providers: [
    HoleService,
    RoleService,
    NotifyService,
    HoleRepoService,
    IsHoleExistConstraint,
    IsCommentExistConstraint,
    IsVoteExistConstraint,
    IsValidPostImgsConstraint,
    IsReplyExistConstraint,
    IsVoteItemExistConstraint,
    HolePostThrottleGuard,
    HoleCategoryService,
    IsCorrectSubCategoryExistConstraint,
  ],
})
export class HoleModule implements NestModule {
  configure() {
    console.log(1)
  }
}
