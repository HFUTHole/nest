import { Body, Controller, Delete, Get, Inject, Post, Query } from '@nestjs/common'
import { HoleService } from '@/modules/hole/hole.service'
import { CreateHoleDto } from '@/modules/hole/dto/create.dto'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetHoleCommentDto,
} from '@/modules/hole/dto/comment.dto'
import { GetHoleDetailQuery } from '@/modules/hole/dto/hole.dto'

@Controller('hole')
export class HoleController {
  @Inject()
  private readonly service: HoleService

  @Get('/list')
  getList(@Query() query: PaginateQuery) {
    return this.service.getList(query)
  }

  @Get('/detail')
  getDetail(@Query() query: GetHoleDetailQuery) {
    return this.service.getDetail(query)
  }

  @Post('/like')
  likeHole(@Body() dto: GetHoleDetailQuery, @User() user: IUser) {
    return this.service.likeHole(dto, user)
  }

  @Delete('/like')
  deleteHole(@Body() dto: GetHoleDetailQuery, @User() user: IUser) {
    return this.service.deleteLike(dto, user)
  }

  @Post('/create')
  create(@Body() body: CreateHoleDto, @User() user: IUser) {
    return this.service.create(body, user)
  }

  @Post('/comment')
  comment(@Body() body: CreateCommentDto, @User() user: IUser) {
    return this.service.createComment(body, user)
  }

  @Get('/comment')
  getComment(@Query() query: GetHoleCommentDto) {
    return this.service.getComment(query)
  }

  @Post('/comment/reply')
  replyComment(@Body() dto: CreateCommentReplyDto, @User() user: IUser) {
    return this.service.replyComment(dto, user)
  }
}
