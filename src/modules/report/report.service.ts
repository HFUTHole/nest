import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Report, ReportType } from '@/entity/report/report.entity'
import { Repository } from 'typeorm'
import { ReportDto } from '@/modules/report/dto/report.dto'
import { IUser } from '@/app'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { createResponse } from '@/utils/create'

@Injectable()
export class ReportService {
  @InjectRepository(Report)
  private readonly reportRepo: Repository<Report>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  async report(dto: ReportDto, reqUser: IUser) {
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const report = this.reportRepo.create({
      ...dto,
    })

    const isReported = await this.reportRepo.findOneBy({
      user: {
        studentId: reqUser.studentId,
      },
    })

    if (isReported) {
      isReported.reason = dto.reason
      await this.reportRepo.save(report)

      return createResponse('更新举报内容成功')
    }

    if (!report.user) {
      report.user = []
    }

    report.user.push(user)

    if (dto.type === ReportType.hole) {
      const hole = await this.holeRepo.findOneBy({ id: dto.holeId })
      report.hole = hole
    } else if (dto.type === ReportType.comment) {
      const comment = await this.commentRepo.findOneBy({ id: dto.commentId })
      report.comment = comment
    } else if (dto.type === ReportType.reply) {
      const reply = await this.replyRepo.findOneBy({ id: dto.replyId })
      report.reply = reply
    }

    await this.reportRepo.save(report)

    return createResponse('举报成功')
  }

  async getReport() {}
}
