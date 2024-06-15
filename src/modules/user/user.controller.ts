import { Body, Controller, Delete, Get, Inject, Post, Query } from '@nestjs/common'

import { UserService } from '@/modules/user/service/user.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { EditProfileDto, GetUserOtherProfileDto } from '@/modules/user/dtos/profile.dto'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { Role } from '@/modules/role/role.constant'
import { UserFollowDto, UserFollowListQuery } from '@/modules/user/dtos/follow.dto'
import { GetUserPostsQuery } from '@/modules/user/dtos/post.dto'

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

  @Get('/other-profile')
  getOtherProfile(@Query() query: GetUserOtherProfileDto) {
    return this.service.getOtherUserProfile(query)
  }

  @Post('/profile')
  editProfile(@Body() dto: EditProfileDto, @User() user: IUser) {
    return this.service.editProfile(dto, user)
  }

  @Get('/post/favorite')
  getFavoritePosts(@Query() query: GetUserPostsQuery, @User() user: IUser) {
    return this.service.getFavoritePosts(query, user)
  }

  @Get('/post/list')
  getPostList(@Query() query: GetUserPostsQuery, @User() user: IUser) {
    return this.service.getPostList(query, user)
  }

  @Get('/comments')
  getComments(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getComments(query, user)
  }

  @Post('/follow')
  follow(@Body() body: UserFollowDto, @User() user: IUser) {
    return this.service.follow(body, user)
  }

  @Delete('/follow')
  unFollow(@Body() body: UserFollowDto, @User() user: IUser) {
    return this.service.unFollow(body, user)
  }

  @Get('/isFollowed')
  isFollowed(@Query() query: UserFollowDto, @User() user: IUser) {
    return this.service.isFollowed(query, user)
  }

  @Get('/following/list')
  getFollowingList(@Query() query: UserFollowListQuery, @User() user: IUser) {
    return this.service.getFollowingList(query, user)
  }
}
