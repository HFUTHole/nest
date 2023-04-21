import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsString } from 'class-validator'
import { IsCommentExist, IsReplyExist } from '@/modules/hole/dto/utils.dto'

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
}

export class IsReplyExistDto {
  @IsReplyExist()
  @IsString()
  id: string
}

export class LikeReplyDto extends IsReplyExistDto {}

export class DeleteLikeReplyDto extends IsReplyExistDto {}
