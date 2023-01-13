import { IsNotEmpty, IsNumber, IsString, Length, Max, Min } from 'class-validator'

export class AuthDto {
  @IsNotEmpty()
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(2019000000, { message: '学号格式错误' })
  @Max(2099000000, { message: '学号格式错误' })
  studentId: number

  @IsNotEmpty()
  @Length(6, 20, {
    message: '密码只能为6-20位长度',
  })
  @IsString()
  password: string
}
