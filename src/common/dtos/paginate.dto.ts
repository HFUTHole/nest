import { IsNumber, IsPositive, Max } from 'class-validator'

export class PaginateQuery {
  @Max(80)
  @IsPositive()
  @IsNumber()
  limit: number = 10

  @IsPositive()
  @IsNumber({ allowNaN: false })
  page: number = 1
}
