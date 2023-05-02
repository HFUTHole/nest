import { Module } from '@nestjs/common'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Report } from '@/entity/report/report.entity'
import { User } from '@/entity/user/user.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Hole } from '@/entity/hole/hole.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Comment, Reply, Hole])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
