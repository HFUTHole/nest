import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsString } from 'class-validator'
import { IsUsedGoodsCategoryExist } from '@/modules/used-goods/dto/utils'

export class GetUsedGoodsListQuery extends PaginateQuery {}

export class GetCollectedUsedGoodsListQuery extends PaginateQuery {}

export class GetUsedGoodsListByCategoryQuery extends PaginateQuery {
  @IsUsedGoodsCategoryExist()
  @IsString()
  category: string
}
