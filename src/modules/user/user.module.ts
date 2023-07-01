import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Hole, NotifyInteractionEntity, NotifySystemEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, NotifyService],
})
export class UserModule {}
