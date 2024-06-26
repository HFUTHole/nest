import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { NotifyController } from './notify.controller'
import { IsNotifyExistConstraint } from '@/modules/notify/dtos/utils.dto'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Post,
      Comment,
      Reply,
      NotifyInteractionEntity,
      NotifySystemEntity,
      UsedGoodsEntity,
    ]),
  ],
  providers: [NotifyService, IsNotifyExistConstraint],
  controllers: [NotifyController],
})
export class NotifyModule {}
