import { IsUserExist } from '@/modules/user/dtos/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class GetConversationListQuery extends PaginateQuery {}

export class GetConversationQuery extends PaginateQuery {
  @IsUserExist()
  @IsNumber()
  userId: number
}
