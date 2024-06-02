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
    ]),
  ],
  controllers: [UsedGoodsController],
  providers: [
    UsedGoodsService,
    IsUsedGoodsCategoryExistConstraint,
    IsUsedGoodsExistConstraint,
    NotifyService,
  ],
})
export class UsedGoodsModule {}
