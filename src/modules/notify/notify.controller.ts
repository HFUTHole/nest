import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { ReadNotifyDto } from '@/modules/notify/dtos/notify.dto'

@Roles()
@Controller('notify')
export class NotifyController {
  @Inject()
  private readonly service: NotifyService

  @Get('base')
  getBaseNotifications(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getUserBaseNotifications(user)
  }

  @Post('read/interaction')
  readInteractionNotify(@Body() dto: ReadNotifyDto, @User() user: IUser) {
    return this.service.readInteractionNotification(dto, user)
  }

  @Post('read/system')
  readSystemNotify(@Body() dto: ReadNotifyDto, @User() user: IUser) {
    return this.service.readSystemNotification(dto, user)
  }
}
