import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Hole])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
