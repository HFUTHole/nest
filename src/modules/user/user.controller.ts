import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'

import { UserService } from '@/modules/user/service/user.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { EditProfileDto } from '@/modules/user/dtos/profile.dto'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { Role } from '@/modules/role/role.constant'

@Roles()
@Controller('user')
export class UserController {
  @Inject()
  private readonly service: UserService

  @Inject()
  private readonly levelService: UserLevelService

  @Get('/profile')
  getProfile(@User() user: IUser) {
    return this.service.getProfile(user)
  }

  @Post('/profile')
  editProfile(@Body() dto: EditProfileDto, @User() user: IUser) {
    return this.service.editProfile(dto, user)
  }

  @Get('post/favorite')
  getFavoritePosts(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getFavoritePosts(query, user)
  }

  @Get('/post/list')
  getPostList(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getPostList(query, user)
  }

  @Get('/comments')
  getComments(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getComments(query, user)
  }
}
