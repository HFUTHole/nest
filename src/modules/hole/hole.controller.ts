import { Body, Controller, Get, Inject, Post, Query, Req } from '@nestjs/common'
import { HoleService } from '@/modules/hole/hole.service'
import { Request } from 'express'
import { CreateHoleDto } from '@/modules/hole/dto/create'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Controller('hole')
export class HoleController {
  @Inject()
  private readonly service: HoleService

  @Get('/list')
  getList(@Query() query: PaginateQuery) {
    return this.service.getList(query)
  }

  @Post('/create')
  create(@Body() body: CreateHoleDto, @User() user: IUser) {
    return this.service.create(body, user)
  }
}
