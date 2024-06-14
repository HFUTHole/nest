import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'
import { IsUsedGoodsCategoryExist } from '@/modules/used-goods/dto/utils'

export class UsedGoodsCreateDto {
  @IsUsedGoodsCategoryExist()
  @IsString()
  category: string

  @ArrayMinSize(1, { message: '请至少上传一张图片哎' })
  @ArrayMaxSize(9, { message: '最多只能上传9张图片哦' })
  @IsString({ each: true })
  imgs: string[]

  @Length(1, 5000, { message: '正文长度必须要有1-5000字哦' })
  @IsString()
  body: string

  @Min(0.01)
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number

  @IsEnum(SchoolAreaEnum)
  area: SchoolAreaEnum
}
