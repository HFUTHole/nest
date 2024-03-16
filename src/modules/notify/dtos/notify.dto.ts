import { IsOptional, IsString } from 'class-validator'
import { IsNotifyExist } from '@/modules/notify/dtos/utils.dto'
import { IsCommentExist, IsPostExist } from '@/modules/post/dto/utils.dto'
import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class ReadNotifyDto {
  @IsNotifyExist()
  @IsString()
  id: string
}

export class CreateSystemNotifyDto {
  @IsString()
  title: string

  @IsString()
  body: string

  @IsUserExist()
  @IsOptional()
  userId?: number

  @IsPostExist()
  @IsOptional()
  postId?: number

  @IsCommentExist()
  @IsOptional()
  commentId?: string

  @IsCommentExist()
  @IsOptional()
  replyId?: string
}
