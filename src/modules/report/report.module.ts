import { Module } from '@nestjs/common'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from '@/entity/report/report.entity'
import { User } from '@/entity/user/user.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { Post } from '@/entity/post/post.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Comment, Reply, Post])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
