import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './service/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Post } from '@/entity/post/post.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { Reply } from '@/entity/post/reply.entity'
import { Comment } from '@/entity/post/comment.entity'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { UserLevelService } from '@/modules/user/service/user-level.service'
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
      UserLevelEntity,
      UsedGoodsEntity,
    ]),
  ],
  controllers: [UserController],

  providers: [UserService, NotifyService, UserLevelService],
})
export class UserModule {}
