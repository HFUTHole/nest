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
  IsPostExist,
  IsReplyExist,
  IsValidPostImgs,
} from '@/modules/post/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import {
  PostDetailCommentMode,
  PostDetailCommentOrderMode,
} from '@/modules/post/post.constant'
import { Limit } from '@/constants/limit'

export class GetPostCommentDto extends PaginateQuery {
  @IsPostExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @IsEnum(PostDetailCommentMode)
  @IsOptional()
  mode: PostDetailCommentMode = PostDetailCommentMode.all

  @IsEnum(PostDetailCommentOrderMode)
  @IsOptional()
  order?: PostDetailCommentOrderMode = PostDetailCommentOrderMode.favorite

  @IsCommentExist()
  @IsOptional()
  commentId?: string
}

export class CreateCommentDto {
  @IsPostExist()
  @IsPositive()
  @IsNumber()
  id: number // 树洞id

  @Length(Limit.postCommentBodyMinLength, Limit.postCommentBodyMaxLength, {
    message: `评论字数限制在${Limit.postCommentBodyMinLength}-${Limit.postCommentBodyMaxLength}字`,
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
  @ArrayMaxSize(Limit.postMaxImgLength, {
    message: `最多只能上传${Limit.postMaxImgLength}张图片哦`,
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
