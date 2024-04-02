import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Validate,
  ValidateNested,
} from 'class-validator'
import { Limit } from '@/constants/limit'
import { IsValidPostImgs } from '@/modules/post/dto/utils.dto'
import { VoteType } from '@/entity/post/vote.entity'
import { PostCategoryEnum } from '@/common/enums/article_category/category'
import { PostClassification } from '@/common/enums/post/category'

class Vote {
  @ArrayMaxSize(Limit.postVoteMaxLength, {
    message: `最多只能创建${Limit.postVoteMaxLength}个选项哦`,
  })
  @MaxLength(Limit.postVoteOptionLength, {
    each: true,
    message: `每个选项最长只能是${Limit.postVoteOptionLength}个字符哦`,
  })
  @IsArray()
  items: string[] = []

  @IsEnum(VoteType)
  @IsOptional()
  type: VoteType = VoteType.single
}

export class CreatePostDto {
  @MaxLength(Limit.postBodyMaxLength, {
    message: `最多只能有${Limit.postBodyMaxLength}个字哦`,
  })
  @IsString()
  body: string

  // @IsValidPostImgs()
  @ArrayMaxSize(Limit.postMaxImgLength, {
    message: `最多只能上传${Limit.postMaxImgLength}张图片哦`,
  })
  @IsArray()
  @IsOptional()
  imgs?: string[] = []

  @MaxLength(Limit.post.titleMaxLength, {
    message: `标题最长只能有${Limit.post.titleMaxLength}个字哦`,
  })
  @IsString()
  @IsOptional()
  title?: string

  // TODO 开一个爬虫去验证是否正确
  @Validate((value: string) => value.startsWith('BV'), {
    message: 'BV号格式不正确',
  })
  @Length(12, 12, { message: '请输入正确的B站的BV视频号哦' })
  @IsString()
  @IsOptional()
  bilibili?: string

  @IsUUID()
  @IsOptional()
  category: string

  @MaxLength(Limit.postVoteOptionLength, {
    each: true,
    message: `每个选项最长只能是${Limit.postVoteOptionLength}个字符哦`,
  })
  @ArrayMaxSize(Limit.postTagsMaxLength, {
    message: `最多只能创建${Limit.postTagsMaxLength}个标签哦`,
  })
  @IsArray()
  @IsOptional()
  tags: string[] = []

  @ValidateNested()
  @IsOptional()
  vote: Vote
}
