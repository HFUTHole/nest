import { IsNumber, IsOptional, IsString, Length } from 'class-validator'
import { IsValidPostImgs } from '@/modules/post/dto/utils.dto'
import { Limit } from '@/constants/limit'
import { IsUserExist, IsUsernameExist } from '@/modules/user/dtos/utils.dto'

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

  @Length(1, 300, {
    message: '最多只能输入300个字符哦',
  })
  @IsString()
  @IsOptional()
  desc?: string
}

export class GetUserOtherProfileDto {
  @IsUserExist()
  @IsNumber()
  userId: number
}
