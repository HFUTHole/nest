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
  IsReplyExistConstraint,
  IsValidPostImgsConstraint,
  IsVoteExistConstraint,
  IsVoteItemExistConstraint,
} from '@/modules/hole/dto/utils.dto'
import { Reply } from '@/entity/hole/reply.entity'
import { RoleService } from '@/modules/role/role.service'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote } from '@/entity/hole/vote.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { Notify } from '@/entity/notify/notify.entity'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { HoleRepoService } from '@/modules/hole/hole.repo'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Hole, Comment, Reply, Tags, Vote, VoteItem, Notify]),
  ],
  controllers: [HoleController],
  providers: [
    HoleService,
    RoleService,
    NotifyService,
    HoleRepoService,
    IsHoleExistConstraint,
    IsCommentExistConstraint,
    IsVoteExistConstraint,
    IsValidPostImgsConstraint,
    IsReplyExistConstraint,
    IsVoteItemExistConstraint,
  ],
})
export class HoleModule {}
