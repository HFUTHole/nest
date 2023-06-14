import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator'
import {
  IsCommentExist,
  IsHoleExist,
  IsReplyExist,
  IsValidPostImgs,
} from '@/modules/hole/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import {
  HoleDetailCommentMode,
  HoleDetailCommentOrderMode,
} from '@/modules/hole/hole.constant'
import { Limit } from '@/constants/limit'

export class GetHoleCommentDto extends PaginateQuery {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @IsEnum(HoleDetailCommentMode)
  @IsOptional()
  mode: HoleDetailCommentMode = HoleDetailCommentMode.all

  @IsEnum(HoleDetailCommentOrderMode)
  @IsOptional()
  order?: HoleDetailCommentOrderMode = HoleDetailCommentOrderMode.favorite
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

  @IsValidPostImgs()
  @ArrayMaxSize(Limit.commentMaxImgLength, {
    message: `最多只能上传${Limit.commentMaxImgLength}张图片哦`,
  })
  @IsArray()
  @IsOptional()
  imgs?: string[] = []
}

export class CreateCommentReplyDto {
  @IsCommentExist()
  @Length(15, 16)
  @IsString()
  @IsOptional()
  commentId?: string

  @Length(1, 1000, { message: '评论字数限制在1-1000字' })
  @IsString()
  body: string

  @IsReplyExist()
  @IsOptional()
  replyId?: string

  @IsValidPostImgs()
  @ArrayMaxSize(Limit.holeMaxImgLength, {
    message: `最多只能上传${Limit.holeMaxImgLength}张图片哦`,
  })
  @IsArray()
  @IsOptional()
  imgs?: string[] = []
}

export class IsCommentIdExistDto {
  @IsCommentExist()
  @IsString()
  id: string
}

export class LikeCommentDto extends IsCommentIdExistDto {}

export class DeleteLikeCommentDto extends IsCommentIdExistDto {}
