import { Body, Controller, Inject, Post } from '@nestjs/common'
import { Roles } from '@/common/decorator/roles.decorator'
import { ReportDto } from '@/modules/report/dto/report.dto'

import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import { ReportService } from '@/modules/report/report.service'

@Roles()
@Controller('report')
export class ReportController {
  @Inject()
  private readonly service: ReportService

  @Post('/post')
  report(@Body() dto: ReportDto, @User() user: IUser) {
    return this.service.report(dto, user)
  }
}
