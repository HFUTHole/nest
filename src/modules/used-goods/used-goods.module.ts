import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { UsedGoodsController } from './used-goods.controller'
import { UsedGoodsService } from './used-goods.service'
import { User } from '@/entity/user/user.entity'
import {
  IsUsedGoodsCategoryExistConstraint,
  IsUsedGoodsExistConstraint,
} from '@/modules/used-goods/dto/utils'
import { NotifyService } from '@/modules/notify/notify.service'
import { Post } from '@/entity/post/post.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { UsedGoodsCommentService } from '@/modules/used-goods/comment.service'
import { PostService } from '@/modules/post/service/post.service'
import { Tags } from '@/entity/post/tags.entity'
import { Vote } from '@/entity/post/vote.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { PostRepoService } from '@/modules/post/service/post.repo'
import { RoleService } from '@/modules/role/role.service'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { UserLevelEntity } from '@/entity/user/level.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsedGoodsEntity,
      UsedGoodsCategoryEntity,
      User,
      Post,
      NotifyInteractionEntity,
      NotifySystemEntity,
      Comment,
      Reply,
      Tags,
      Vote,
      VoteItem,
      PostCategoryEntity,
      UserLevelEntity,
    ]),
  ],
  controllers: [UsedGoodsController],
  providers: [
    UsedGoodsService,
    IsUsedGoodsCategoryExistConstraint,
    IsUsedGoodsExistConstraint,
    NotifyService,
    UsedGoodsCommentService,
    PostService,
    PostRepoService,
    RoleService,
    UserLevelService,
  ],
})
export class UsedGoodsModule {}
