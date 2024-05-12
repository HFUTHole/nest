import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class UserFollowDto {
  @IsUserExist()
  userId: number
}
