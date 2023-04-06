import { IsEnum, IsNumber, IsPositive, IsString, Length } from 'class-validator'
import { IsCommentExist, IsHoleExist } from '@/modules/hole/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { HoleDetailCommentMode } from '@/modules/hole/hole.constant'
import { Limit } from '@/constants/limit'

export class GetHoleCommentDto extends PaginateQuery {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @IsEnum(HoleDetailCommentMode)
  mode: HoleDetailCommentMode = HoleDetailCommentMode.all
}

export class CreateCommentDto {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @Length(Limit.holeCommentBodyMinLength, Limit.holeCommentBodyMaxLength, {
    message: `评论字数限制在${Limit.holeCommentBodyMinLength}-${Limit.holeCommentBodyMaxLength}字`,
  })
  @IsString()
  body: string
}

export class CreateCommentReplyDto {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @IsCommentExist()
  @Length(15, 16)
  @IsString()
  commentId: string

  @Length(1, 1000, { message: '评论字数限制在1-1000字' })
  @IsString()
  body: string
}
