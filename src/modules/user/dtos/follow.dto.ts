import { IsUserExist } from '@/modules/user/dtos/utils.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { IsEnum } from 'class-validator'

export class UserFollowDto {
  @IsUserExist()
  userId: number
}

export class UserFollowListQuery {
  @IsUserExist()
  userId: number

  @IsEnum(['following', 'followers'])
  type: 'following' | 'followers'
}
