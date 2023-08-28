import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { IsCorrectSubCategory, IsHoleExist } from '@/modules/hole/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { ArticleCategoryEnum } from '@/common/enums/article_category/category'
import { HoleClassification } from '@/common/enums/hole/category'

export enum HoleListMode {
  latest = 'latest',
  hot = 'hot',
}

export class GetHoleListQuery extends PaginateQuery {
  @IsEnum(HoleListMode, { message: '没有这个模式哦' })
  @IsString()
  mode = HoleListMode.latest

  // TODO remove
  @IsEnum(ArticleCategoryEnum)
  @IsOptional()
  category?: ArticleCategoryEnum

  @IsEnum(HoleClassification)
  @IsOptional()
  classification?: HoleClassification

  @IsCorrectSubCategory()
  @IsOptional()
  subClassification?: string
}

export class GetHoleDetailQuery {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number
}

export class DeleteHoleDto extends GetHoleDetailQuery {}
