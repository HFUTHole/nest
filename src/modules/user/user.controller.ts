import { Body, Controller, Get, Inject, Query } from '@nestjs/common'

import { UserService } from '@/modules/user/user.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Roles()
@Controller('user')
export class UserController {
  @Inject()
  private readonly service: UserService

  @Get('/profile')
  getProfile(@User() user: IUser) {
    return this.service.getProfile(user)
  }

  @Get('/hole/favorite')
  getFavoriteHoles(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getFavoriteHoles(query, user)
  }

  @Get('/hole/list')
  getHoleList(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getHoleList(query, user)
  }

  @Get('/comments')
  getComments(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getComments(query, user)
  }
}
