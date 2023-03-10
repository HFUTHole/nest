import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsString } from 'class-validator'
import { IsCommentExist } from '@/modules/hole/dto/utils.dto'

export class GetRepliesQuery extends PaginateQuery {
  @IsCommentExist()
  @IsString()
  id: string
}
