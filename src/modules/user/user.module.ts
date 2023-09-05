import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './service/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { UserLevelService } from '@/modules/user/service/user-level.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Hole,
      Comment,
      Reply,
      NotifyInteractionEntity,
      NotifySystemEntity,
      UserLevelEntity,
    ]),
  ],
  controllers: [UserController],

  providers: [UserService, NotifyService, UserLevelService],
})
export class UserModule {}
