import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Notify } from '@/entity/notify/notify.entity'
import { NotifyService } from '@/modules/notify/notify.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Hole, Notify])],
  controllers: [UserController],
  providers: [UserService, NotifyService],
})
export class UserModule {}
