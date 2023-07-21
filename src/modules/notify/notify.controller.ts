import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { Roles } from '@/common/decorator/roles.decorator'
import { CreateSystemNotifyDto, ReadNotifyDto } from '@/modules/notify/dtos/notify.dto'
import { Role } from '@/modules/role/role.constant'

@Roles()
@Controller('notify')
export class NotifyController {
  @Inject()
  private readonly service: NotifyService

  @Get('base')
  getBaseNotifications(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getUserBaseNotifications(user)
  }

  @Get('interaction')
  getInteractionNotifications(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getInteractionNotifications(query, user)
  }

  @Roles([Role.Admin])
  @Post('system')
  createSystemNotification(@Body() dto: CreateSystemNotifyDto) {
    return this.service.createSystemNotify(dto)
  }

  @Get('system')
  getSystemNotifications(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getSystemNotifications(query, user)
  }

  @Post('read/interaction')
  readInteractionNotify(@Body() dto: ReadNotifyDto, @User() user: IUser) {
    return this.service.readInteractionNotification(dto, user)
  }

  @Post('read/interaction/all')
  readAllInteractionNotify(@User() user: IUser) {
    return this.service.readAllInteractionNotification(user)
  }

  @Post('read/system/all')
  readAllSystemNotify(@User() user: IUser) {
    return this.service.readAllSystemNotification(user)
  }

  @Post('read/system')
  readSystemNotify(@Body() dto: ReadNotifyDto, @User() user: IUser) {
    return this.service.readSystemNotification(dto, user)
  }
}
