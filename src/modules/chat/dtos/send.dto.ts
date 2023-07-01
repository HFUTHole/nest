import { IsString } from 'class-validator'
import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class ChatSendDto {
  @IsString()
  body: string

  @IsUserExist()
  toUserId: number
}
