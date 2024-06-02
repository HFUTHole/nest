import { IsUsedGoodsExist } from '@/modules/used-goods/dto/utils'
import {
  ArrayMaxSize,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { UsedGoodsStatusEnum } from '@/common/enums/used-goods/use-goods-status.enum'

export class EditUsedGoods {
  @IsUsedGoodsExist()
  id: string

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  price?: number

  @Length(1, 5000, { message: '商品描述只能在1-5000字哦' })
  @IsString()
  @IsOptional()
  body?: string

  @ArrayMaxSize(9, { message: '最多只能有9张图片哦' })
  @IsString({ each: true })
  @IsOptional()
  imgs?: string[]

  @IsEnum(UsedGoodsStatusEnum)
  @IsOptional()
  status?: UsedGoodsStatusEnum
}
