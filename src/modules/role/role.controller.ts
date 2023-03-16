import { Body, Controller, Inject, Post } from '@nestjs/common'
import { Roles } from '@/common/decorator/roles.decorator'
import { Role } from '@/modules/role/role.constant'
import { RoleService } from '@/modules/role/role.service'
import { BanDto, LiberateDto } from '@/modules/role/role.dto'

@Roles([Role.Admin])
@Controller('role')
export class RoleController {
  @Inject()
  private readonly service: RoleService

  @Post('/ban')
  ban(@Body() dto: BanDto) {
    return this.service.ban(dto)
  }

  @Post('liberate')
  liberate(@Body() dto: LiberateDto) {
    return this.service.liberate(dto)
  }
}
