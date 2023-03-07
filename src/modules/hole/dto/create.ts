import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateHoleDto {
  @MaxLength(4096, { message: '最多只能有4096个字哦' })
  @IsString()
  body: string

  @IsArray()
  @IsOptional()
  imgs: string[]
}
