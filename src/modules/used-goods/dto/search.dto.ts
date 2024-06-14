import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

export class UsedGoodsSearchQuery extends PaginateQuery {
  @MaxLength(400, { message: '搜索关键字不能超过400字哦' })
  @MinLength(1, { message: '搜索关键字不能为空哦' })
  @IsString()
  keywords: string

  @IsEnum(SchoolAreaEnum)
  @IsOptional()
  area?: SchoolAreaEnum

  @IsEnum(['asc', 'desc', 'latest'])
  price: 'asc' | 'desc' | 'latest' = 'latest'
}
