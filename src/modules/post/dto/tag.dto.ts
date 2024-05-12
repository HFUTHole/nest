import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsString } from 'class-validator'
import { IsTagExist } from '@/modules/post/dto/utils.dto'

export class GetPostTagListQuery extends PaginateQuery {
  @IsTagExist()
  @IsString()
  tag: string
}

export class GetPostTagDetailQuery {
  @IsTagExist()
  @IsString()
  tag: string
}
