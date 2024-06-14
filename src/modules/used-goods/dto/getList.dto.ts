import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import { IsUsedGoodsCategoryExist } from '@/modules/used-goods/dto/utils'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'
import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class GetUsedGoodsListQuery extends PaginateQuery {}

export class GetCollectedUsedGoodsListQuery extends PaginateQuery {}

export class GetUsedGoodsListByCategoryQuery extends PaginateQuery {
  @IsUsedGoodsCategoryExist()
  @IsString()
  @IsOptional()
  category?: string

  @IsEnum(SchoolAreaEnum)
  @IsOptional()
  area?: SchoolAreaEnum
}

export class GetUserUsedGoodsListQuery extends PaginateQuery {
  @IsEnum(['posted', 'offline'])
  type: 'posted' | 'offline' = 'posted'
}

export class GetOtherUserUsedGoodsList extends GetCollectedUsedGoodsListQuery {
  @IsUserExist()
  userId: number
}
