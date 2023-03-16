import { IsNumber } from 'class-validator'
import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class BanDto {
  @IsUserExist()
  @IsNumber()
  userId: number
}

export class LiberateDto extends BanDto {}
