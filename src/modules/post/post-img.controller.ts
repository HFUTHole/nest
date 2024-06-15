import { Controller, Get, Inject, Query } from '@nestjs/common'
import { Roles } from '@/common/decorator/roles.decorator'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { PostImgService } from './service/post-img.service'

@Roles()
@Controller('/img')
export class PostImgController {
  @Inject()
  private readonly service: PostImgService

  @Get('/token')
  getToken(@User() user: IUser) {
    return this.service.getToken(user)
  }
}
