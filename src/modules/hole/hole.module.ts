import { Module } from '@nestjs/common'
import { HoleController } from './hole.controller'
import { HoleService } from './hole.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import {
  IsCommentExistConstraint,
  IsHoleExistConstraint,
} from '@/modules/hole/dto/utils.dto'
import { Reply } from '@/entity/hole/reply.entity'
import { RoleService } from '@/modules/role/role.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, Hole, Comment, Reply])],
  controllers: [HoleController],
  providers: [HoleService, IsHoleExistConstraint, IsCommentExistConstraint, RoleService],
})
export class HoleModule {}
