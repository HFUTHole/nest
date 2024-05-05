import { IsUserExist } from '@/modules/user/dtos/utils.dto'
import { IsNumber, IsNumberString } from 'class-validator'
import { Type } from 'class-transformer'

export class UserFollowDto {
  @IsUserExist()
  userId: number
}
