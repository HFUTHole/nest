import { IsString } from 'class-validator'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

export class SearchQuery extends PaginateQuery {
  @IsString()
  keywords: string
}
