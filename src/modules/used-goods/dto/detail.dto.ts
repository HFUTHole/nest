import { IsString } from 'class-validator'
import { IsUsedGoodsExist } from '@/modules/used-goods/dto/utils'

export class GetUsedGoodsDetailQuery {
  @IsUsedGoodsExist()
  @IsString()
  id: string
}

export class HiddenUsedGoodsQuery {
  @IsUsedGoodsExist()
  @IsString()
  id: string
}
