import { IsString } from 'class-validator'
import { IsNotifyExist } from '@/modules/notify/dtos/utils.dto'

export class ReadNotifyDto {
  @IsNotifyExist()
  @IsString()
  id: string
}
