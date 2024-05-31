import { Module, NestModule } from '@nestjs/common'
import { PostController } from './post.controller'
import { PostService } from './service/post.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import {
  IsCommentExistConstraint,
  IsCorrectSubCategoryExistConstraint,
  IsPostExistConstraint,
  IsReplyExistConstraint,
  IsTagExistConstraint,
  IsValidPostImgsConstraint,
  IsVoteExistConstraint,
  IsVoteItemExistConstraint,
} from '@/modules/post/dto/utils.dto'
import { Reply } from '@/entity/post/reply.entity'
import { RoleService } from '@/modules/role/role.service'
import { Tags } from '@/entity/post/tags.entity'
import { Vote } from '@/entity/post/vote.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { PostRepoService } from '@/modules/post/service/post.repo'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { PostPostThrottleGuard } from '@/modules/post/guard/post-throttle.guard'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { PostWebController } from './post-web.controller'
import { PostWebService } from './service/post-web.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Comment,
      Reply,
      Tags,
      Vote,
      VoteItem,
      NotifyInteractionEntity,
      NotifySystemEntity,
      PostCategoryEntity,
      UserLevelEntity,
    ]),
  ],
  controllers: [PostController, PostWebController],
  providers: [
    PostService,
    RoleService,
    NotifyService,
    PostRepoService,
    UserLevelService,
    IsPostExistConstraint,
    IsCommentExistConstraint,
    IsVoteExistConstraint,
    IsValidPostImgsConstraint,
    IsReplyExistConstraint,
    IsVoteItemExistConstraint,
    PostPostThrottleGuard,
    IsCorrectSubCategoryExistConstraint,
    IsTagExistConstraint,
    PostWebService,
  ],
})
export class PostModule implements NestModule {
  configure() {
    console.log(1)
  }
}
