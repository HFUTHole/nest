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

@Module({
  imports: [TypeOrmModule.forFeature([User, Hole, Comment])],
  controllers: [HoleController],
  providers: [HoleService, IsHoleExistConstraint, IsCommentExistConstraint],
})
export class HoleModule {}
