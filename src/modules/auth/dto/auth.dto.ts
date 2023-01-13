import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator'
import { AuthDto } from '@/modules/auth/dto/studentId.dto'

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
