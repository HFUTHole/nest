import { IsNumber, IsPositive } from 'class-validator'
import { IsHoleExist } from '@/modules/hole/dto/utils.dto'

export class GetHoleDetailQuery {
  @IsHoleExist()
  @IsPositive()
  @IsNumber()
  id: number
}

export class DeleteHoleDto extends GetHoleDetailQuery {}
