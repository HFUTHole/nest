import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  ValidateNested,
} from 'class-validator'
import { Limit } from '@/constants/limit'
import { IsValidPostImgs } from '@/modules/hole/dto/utils.dto'

class Vote {
  @ArrayMaxSize(Limit.holeVoteMaxLength, {
    message: `最多只能创建${Limit.holeVoteMaxLength}个选项哦`,
  })
  @MaxLength(Limit.holeVoteOptionLength, {
    each: true,
    message: `每个选项最长只能是${Limit.holeVoteOptionLength}个字符哦`,
  })
  @IsArray()
  items: string[] = []

  @IsBoolean()
  isMultipleVote: boolean = false

  @MinDate(() => new Date(), { message: '结束时间不能早于当前时间哦' })
  @IsDate()
  endTime: Date = null
}

export class CreateHoleDto {
  @MaxLength(Limit.holeBodyMaxLength, {
    message: `最多只能有${Limit.holeBodyMaxLength}个字哦`,
  })
  @IsString()
  body: string

  @IsValidPostImgs()
  @ArrayMaxSize(Limit.holeMaxImgLength, {
    message: `最多只能上传${Limit.holeMaxImgLength}张图片哦`,
  })
  @IsArray()
  @IsOptional()
  imgs?: string[] = []

  @MaxLength(Limit.holeVoteOptionLength, {
    each: true,
    message: `每个选项最长只能是${Limit.holeVoteOptionLength}个字符哦`,
  })
  @ArrayMaxSize(Limit.holeTagsMaxLength, {
    message: `最多只能创建${Limit.holeTagsMaxLength}个标签哦`,
  })
  @IsArray()
  @IsOptional()
  tags: string[] = []

  @ValidateNested()
  @IsOptional()
  vote: Vote
}
