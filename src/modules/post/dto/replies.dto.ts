import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { IsCommentExist, IsReplyExist } from '@/modules/post/dto/utils.dto'
import { PostReplyOrderMode } from '@/modules/post/post.constant'

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

  @IsCommentExist({
    each: true,
  })
  @IsArray()
  @IsOptional()
  filterReplyIds?: string[]

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
