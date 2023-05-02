import { IsEnum, IsOptional, IsString, Length } from 'class-validator'
import { ReportType } from '@/entity/report/report.entity'
import { Limit } from '@/constants/limit'
import { IsCommentExist, IsHoleExist, IsReplyExist } from '@/modules/hole/dto/utils.dto'

export class ReportDto {
  @IsEnum(ReportType)
  type: ReportType

  @Length(Limit.reportReasonMinLength, Limit.reportReasonMaxLength, {
    message: `举报理由长度必须在${Limit.reportReasonMinLength}到${Limit.reportReasonMaxLength}之间`,
  })
  @IsString()
  reason: string

  @IsHoleExist()
  @IsOptional()
  holeId: number

  @IsCommentExist()
  @IsOptional()
  commentId: string

  @IsReplyExist()
  @IsOptional()
  replyId: string
}
