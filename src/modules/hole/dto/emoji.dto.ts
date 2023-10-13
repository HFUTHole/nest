import { IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator'
import {
  IsCommentExist,
  IsHoleExist,
  IsReplyExist,
  IsValidExpressEmoji,
} from '@/modules/hole/dto/utils.dto'

export class ExpressEmojiDto {
  @IsValidExpressEmoji()
  @IsString()
  emoji: string

  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  holeId?: number

  @IsCommentExist()
  @Length(15, 16)
  @IsString()
  @IsOptional()
  commentId?: string

  @IsReplyExist()
  @Length(15, 16)
  @IsString()
  @IsOptional()
  replyId?: string
}
