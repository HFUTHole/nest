import { IsNumber, IsPositive } from 'class-validator'

export class PaginateQuery {
  @IsPositive()
  @IsNumber()
  limit: number = 10

  @IsPositive()
  @IsNumber({ allowNaN: false })
  page: number = 1
}
