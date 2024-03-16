import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { IsCorrectSubCategory, IsPostExist } from '@/modules/post/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { PostClassification } from '@/common/enums/post/category'
import { PostCategoryEnum } from '@/common/enums/article_category/category'

export enum PostListMode {
  latest = 'latest',
  hot = 'hot',
}

export class GetPostListQuery extends PaginateQuery {
  @IsEnum(PostListMode, { message: '没有这个模式哦' })
  @IsString()
  mode = PostListMode.latest

  @IsEnum(PostCategoryEnum)
  @IsOptional()
  category?: PostCategoryEnum
}

export class GetPostDetailQuery {
  @IsPostExist()
  @IsPositive()
  @IsNumber()
  id: number
}

export class DeletePostDto extends GetPostDetailQuery {}
