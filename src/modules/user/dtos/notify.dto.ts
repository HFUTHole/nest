import { IsString } from 'class-validator'
import { IsNotifyExist } from '@/modules/user/dtos/utils.dto'

export class ReadNotifyDto {
  @IsNotifyExist({ each: true })
  @IsString()
  id: string
}
