import { Module } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notify } from '@/entity/notify/notify.entity'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Notify, User, Hole, Comment, Reply])],
  providers: [NotifyService],
})
export class NotifyModule {}
