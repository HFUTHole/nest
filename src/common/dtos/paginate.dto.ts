import { IsNumber, IsPositive } from 'class-validator'

export class PaginateQuery {
  @IsPositive()
  @IsNumber()
  limit = 10

  @IsPositive()
  @IsNumber()
  page = 1
}
