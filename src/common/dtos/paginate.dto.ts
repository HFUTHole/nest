import { IsNumber, IsPositive } from 'class-validator'

export class PaginateQuery {
  @IsPositive()
  @IsNumber()
  limit: number

  @IsPositive()
  @IsNumber()
  page: number
}
