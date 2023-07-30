import { IsOptional, IsString, Length } from 'class-validator'
import { IsValidPostImgs } from '@/modules/hole/dto/utils.dto'
import { Limit } from '@/constants/limit'
import { IsUsernameExist } from '@/modules/user/dtos/utils.dto'

export class EditProfileDto {
  @IsUsernameExist()
  @Length(Limit.user.minUsernameLength, Limit.user.maxUsernameLength, {
    message: `用户名长度只能为${Limit.user.minUsernameLength}-${Limit.user.maxUsernameLength}`,
  })
  @IsString()
  @IsOptional()
  username?: string

  @IsValidPostImgs()
  @IsString()
  @IsOptional()
  avatar?: string
}
