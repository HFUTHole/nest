import { IsString } from 'class-validator'
import { IsUsedGoodsExist } from '@/modules/used-goods/dto/utils'

export class CollectUsedGoodsDto {
  @IsUsedGoodsExist()
  @IsString()
  id: string
}
