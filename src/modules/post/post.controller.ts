import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Ip,
  Post,
  Query,
  Req,
} from '@nestjs/common'
import { PostService } from '@/modules/post/service/post.service'
import { CreatePostDto } from '@/modules/post/dto/create.dto'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetPostCommentDto,
  LikeCommentDto,
} from '@/modules/post/dto/comment.dto'
import {
  DeletePostDto,
  GetPostDetailQuery,
  GetPostListQuery,
  LikePostDto,
} from '@/modules/post/dto/post.dto'
import { GetRepliesQuery, LikeReplyDto } from '@/modules/post/dto/replies.dto'
import { Roles } from '@/common/decorator/roles.decorator'
import { PostVoteDto } from '@/modules/post/dto/vote.dto'
import { SearchQuery } from '@/modules/post/dto/search.dto'
import { GetPostTagDetailQuery, GetPostTagListQuery } from '@/modules/post/dto/tag.dto'
import { Role } from '@/modules/role/role.constant'
import { RealIp } from 'nestjs-real-ip'

@Roles()
@Controller('post')
export class PostController {
  @Inject()
  private readonly service: PostService

  @Roles([Role.Admin, Role.User, Role.Banned])
  @Get('/list')
  getList(@Query() query: GetPostListQuery, @User() user: IUser) {
    return this.service.getList(query, user)
  }

  @Get('/list/follow')
  getFollowList(@Query() query: GetPostListQuery, @User() user: IUser) {
    return this.service.getFollowList(query, user)
  }

  @Roles([Role.Admin, Role.User, Role.Banned])
  @Get('/detail')
  getDetail(@Query() query: GetPostDetailQuery, @User() user: IUser) {
    return this.service.getDetail(query, user)
  }

  // @UseGuards(PostPostThrottleGuard)
  @Post('/create')
  create(@Body() body: CreatePostDto, @User() user: IUser, @RealIp() ip: string) {
    return this.service.create(body, user, ip)
  }

  @Delete('/delete')
  delete(@Body() body: DeletePostDto, @User() user: IUser) {
    return this.service.delete(body, user)
  }

  @Get('/tags')
  getTags() {
    return this.service.getTags()
  }

  @Post('/vote')
  vote(@Body() dto: PostVoteDto, @User() user: IUser) {
    return this.service.vote(dto, user)
  }

  @Post('/like')
  likePost(@Body() dto: LikePostDto, @User() user: IUser) {
    return this.service.likePost(dto, user)
  }

  @Delete('/like')
  deleteLike(@Body() dto: LikePostDto, @User() user: IUser) {
    return this.service.deleteLike(dto, user)
  }

  @Post('/comment')
  comment(
    @Body() body: CreateCommentDto,
    @User() user: IUser,
    @RealIp() ip: string,
    @Req() request: Request,
  ) {
    console.log('X-Real-IP:', request.headers['x-real-ip'])
    console.log('X-Forwarded-For:', request.headers['x-forwarded-for'])
    return this.service.createComment(body, user, ip)
  }

  @Get('/comment')
  getComment(@Query() query: GetPostCommentDto, @User() user: IUser) {
    return this.service.getComment(query, user)
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
  replyComment(
    @Body() dto: CreateCommentReplyDto,
    @User() user: IUser,
    @RealIp() ip: string,
  ) {
    return this.service.replyComment(dto, user, ip)
  }

  @Get('/comment/replies')
  getReplies(@Query() query: GetRepliesQuery, @User() user: IUser) {
    return this.service.getReplies(query, user)
  }

  @Post('/comment/reply/like')
  likeReply(@Body() dto: LikeReplyDto, @User() user: IUser) {
    return this.service.likeReply(dto, user)
  }

  @Delete('/comment/reply/like')
  deleteReply(@Body() dto: LikeReplyDto, @User() user: IUser) {
    return this.service.deleteReplyLike(dto, user)
  }

  @Get('/search')
  search(@Query() query: SearchQuery) {
    return this.service.search(query)
  }

  @Get('/categories')
  getCategories() {
    return this.service.getCategories()
  }

  @Get('/list/tag')
  getTagPostList(@Query() query: GetPostTagListQuery, @User() reqUser: IUser) {
    return this.service.getTagPostList(query, reqUser)
  }

  @Get('/tag/detail')
  getTagDetail(@Query() query: GetPostTagDetailQuery, @User() reqUser: IUser) {
    return this.service.getTagDetail(query, reqUser)
  }
}
