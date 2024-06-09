import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator'
import { AuthDto, StudentIdDto } from '@/modules/auth/dto/studentId.dto'
import { Limit } from '@/constants/limit'
import { IsUsernameExist } from '@/modules/user/dtos/utils.dto'
import { Long } from 'typeorm'

export class LoginDto extends AuthDto {

  @IsPhoneNumber("CN")
  phoneNumber: string

}

export class RegisterDto extends AuthDto {
  @IsUsernameExist()
  @Length(Limit.user.minUsernameLength, Limit.user.maxUsernameLength, {
    message: `用户名长度只能为${Limit.user.minUsernameLength}-${Limit.user.maxUsernameLength}`,
  })
  @IsString()
  username: string

  @IsString()
  @Length(6, 30)
  hfutPassword: string
}


export class SMSRegisterDto {
  @IsUsernameExist()
  @Length(Limit.user.minUsernameLength, Limit.user.maxUsernameLength, {
    message: `用户名长度只能为${Limit.user.minUsernameLength}-${Limit.user.maxUsernameLength}`,
  })
  @IsString()
  username: string

  @IsNotEmpty()
  @Length(6, 20, {
    message: '密码只能为6-20位长度',
  })
  @IsString()
  password: string

  //@IsPhoneNumber('CN')
  @IsNotEmpty()
  phoneNumber: string

  @IsNotEmpty()
  verifyCode: number
}


export class SMSRequestDto {
  
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  phoneNumber: string

}

export class ForgetPasswordDto extends StudentIdDto {
  @IsString()
  @Length(6, 30)
  hfutPassword: string

  @IsNotEmpty()
  @Length(6, 20, {
    message: '密码只能为6-20位长度',
  })
  @IsString()
  password: string
}
