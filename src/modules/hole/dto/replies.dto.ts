import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { IsCommentExist, IsReplyExist } from '@/modules/hole/dto/utils.dto'
import { HoleReplyOrderMode } from '@/modules/hole/hole.constant'

export class ReplyReplyDto {
  @IsCommentExist()
  @IsString()
  commentId: string

  @IsString()
  id: string

  @IsString()
  body: string
}

export class GetRepliesQuery extends PaginateQuery {
  @IsCommentExist()
  @IsString()
  id: string

  @IsEnum(HoleReplyOrderMode)
  @IsOptional()
  order?: HoleReplyOrderMode = HoleReplyOrderMode.favorite

  @IsReplyExist()
  @IsString()
  @IsOptional()
  replyId?: string
}

export class IsReplyExistDto {
  @IsReplyExist()
  @IsString()
  id: string
}

export class LikeReplyDto extends IsReplyExistDto {}

export class DeleteLikeReplyDto extends IsReplyExistDto {}
