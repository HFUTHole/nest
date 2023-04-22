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
  LikeCommentDto,
} from '@/modules/hole/dto/comment.dto'
import { GetHoleDetailQuery, GetHoleListQuery } from '@/modules/hole/dto/hole.dto'
import {
  GetRepliesQuery,
  LikeReplyDto,
  ReplyReplyDto,
} from '@/modules/hole/dto/replies.dto'
import { Roles } from '@/common/decorator/roles.decorator'
import { PostVoteDto } from '@/modules/hole/dto/vote.dto'
import { SearchQuery } from '@/modules/hole/dto/search.dto'

@Roles()
@Controller('hole')
export class HoleController {
  @Inject()
  private readonly service: HoleService

  @Get('/list')
  getList(@Query() query: GetHoleListQuery) {
    return this.service.getList(query)
  }

  @Get('/detail')
  getDetail(@Query() query: GetHoleDetailQuery, @User() user: IUser) {
    return this.service.getDetail(query, user)
  }

  @Post('/create')
  create(@Body() body: CreateHoleDto, @User() user: IUser) {
    return this.service.create(body, user)
  }

  // @Delete('/')
  // delete(@Body() body: DeleteHoleDto, @User() user: IUser) {
  //   return this.service.delete(body, user)
  // }

  @Get('/tags')
  getTags() {
    return this.service.getTags()
  }

  @Post('/vote')
  vote(@Body() dto: PostVoteDto, @User() user: IUser) {
    return this.service.vote(dto, user)
  }

  @Post('/like')
  likeHole(@Body() dto: GetHoleDetailQuery, @User() user: IUser) {
    return this.service.likeHole(dto, user)
  }

  @Delete('/like')
  deleteLike(@Body() dto: GetHoleDetailQuery, @User() user: IUser) {
    return this.service.deleteLike(dto, user)
  }

  @Post('/comment')
  comment(@Body() body: CreateCommentDto, @User() user: IUser) {
    return this.service.createComment(body, user)
  }

  @Get('/comment')
  getComment(@Query() query: GetHoleCommentDto) {
    return this.service.getComment(query)
  }

  @Post('/comment/like')
  likeComment(@Body() dto: LikeCommentDto, @User() user: IUser) {
    return this.service.likeComment(dto, user)
  }

  @Delete('/comment/like')
  deleteLikeComment(@Body() dto: LikeCommentDto, @User() user: IUser) {
    return this.service.deleteLikeComment(dto, user)
  }

  @Post('/comment/reply')
  replyComment(@Body() dto: CreateCommentReplyDto, @User() user: IUser) {
    return this.service.replyComment(dto, user)
  }

  @Post('/comment/reply/reply')
  replyReply(@Body() dto: ReplyReplyDto, @User() user: IUser) {
    return this.service.replyReply(dto, user)
  }

  @Get('/comment/replies')
  getReplies(@Query() query: GetRepliesQuery, @User() user: IUser) {
    return this.service.getReplies(query, user)
  }

  @Post('/comment/reply/like')
  likeReply(@Query() dto: LikeReplyDto, @User() user: IUser) {
    return this.service.likeReply(dto, user)
  }

  @Delete('/comment/reply/like')
  deleteReply(@Query() dto: LikeReplyDto, @User() user: IUser) {
    return this.service.deleteReplyLike(dto, user)
  }

  @Get('/search')
  search(@Query() query: SearchQuery) {
    return this.service.search(query)
  }
}
