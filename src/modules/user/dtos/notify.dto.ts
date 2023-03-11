import { IsString } from 'class-validator'

export class ReadNotifyDto {
  @IsString()
  id: string
}
