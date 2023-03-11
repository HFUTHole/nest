import { Controller, Get, Inject, Post, Query } from '@nestjs/common'

import { UserService } from '@/modules/user/user.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { Role } from '@/modules/role/role.constant'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Roles()
@Controller('user')
export class UserController {
  @Inject()
  private readonly service: UserService

  @Get('notify')
  getNotifications(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getNotifications(query, user)
  }

  @Post('notify/read')
  readNotify() {}
}
