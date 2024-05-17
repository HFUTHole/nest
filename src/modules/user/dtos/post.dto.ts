import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsNumber, IsOptional } from 'class-validator'
import { IsUserExist } from '@/modules/user/dtos/utils.dto'

export class GetUserPostsQuery extends PaginateQuery {
  @IsUserExist()
  @IsNumber()
  @IsOptional()
  userId?: number
}
