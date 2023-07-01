import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { NotifyController } from './notify.controller'
import { IsNotifyExistConstraint } from '@/modules/notify/dtos/utils.dto'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Hole,
      Comment,
      Reply,
      NotifyInteractionEntity,
      NotifySystemEntity,
    ]),
  ],
  providers: [NotifyService, IsNotifyExistConstraint],
  controllers: [NotifyController],
})
export class NotifyModule {}
