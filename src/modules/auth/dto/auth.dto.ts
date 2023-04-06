import { IsNotEmpty, IsString, Length } from 'class-validator'
import { AuthDto, StudentIdDto } from '@/modules/auth/dto/studentId.dto'

export class LoginDto extends AuthDto {}

export class RegisterDto extends AuthDto {
  @IsString()
  @Length(2, 10, {
    message: '用户名长度只能为2-10',
  })
  username: string

  @IsString()
  @Length(6, 30)
  hfutPassword: string
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
