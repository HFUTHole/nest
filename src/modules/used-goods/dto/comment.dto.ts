import {
  IsCommentExist,
  IsPostExist,
  IsReplyExist,
  IsValidPostImgs,
} from '@/modules/post/dto/utils.dto'
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
import { Limit } from '@/constants/limit'
import { IsUsedGoodsExist } from '@/modules/used-goods/dto/utils'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import {
  PostDetailCommentMode,
  PostDetailCommentOrderMode,
} from '@/modules/post/post.constant'

export class GoodsCreateCommentDto {
  @IsUsedGoodsExist()
  @IsString()
  id: string

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

export class GoodsGetCommentDto extends PaginateQuery {
  @IsUsedGoodsExist()
  @IsString()
  id: string

  @IsEnum(PostDetailCommentMode)
  @IsOptional()
  mode: PostDetailCommentMode = PostDetailCommentMode.all

  @IsEnum(PostDetailCommentOrderMode)
  @IsOptional()
  order?: PostDetailCommentOrderMode = PostDetailCommentOrderMode.favorite

  @IsCommentExist()
  @IsOptional()
  commentId?: string

  @IsReplyExist()
  @IsOptional()
  replyId?: string
}
