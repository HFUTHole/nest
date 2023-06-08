import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator'
import { IsHoleExist } from '@/modules/hole/dto/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { ArticleCategoryEnum } from '@/common/enums/article_category/category'

export enum HoleListMode {
  random = 'random',
  timeline = 'timeline',
}

export class GetHoleListQuery extends PaginateQuery {
  @IsEnum(HoleListMode, { message: '没有这个模式哦' })
  @IsString()
  mode = HoleListMode.random

  @IsEnum(ArticleCategoryEnum)
  @IsOptional()
  category = ArticleCategoryEnum.hfutLife
}

export class GetHoleDetailQuery {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number
}

export class DeleteHoleDto extends GetHoleDetailQuery {}
