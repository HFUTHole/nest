import { Body, Controller, Delete, Get, Inject, Ip, Post, Query } from '@nestjs/common'
import { UsedGoodsService } from '@/modules/used-goods/used-goods.service'
import { UsedGoodsCreateDto } from '@/modules/used-goods/dto/create.dto'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import {
  GetCollectedUsedGoodsListQuery,
  GetOtherUserUsedGoodsList,
  GetUsedGoodsListByCategoryQuery,
  GetUsedGoodsListQuery,
  GetUserUsedGoodsListQuery,
} from '@/modules/used-goods/dto/getList.dto'
import { CollectUsedGoodsDto } from '@/modules/used-goods/dto/collect.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { EditUsedGoods } from '@/modules/used-goods/dto/post.dto'
import {
  GetUsedGoodsDetailQuery,
  HiddenUsedGoodsQuery,
} from '@/modules/used-goods/dto/detail.dto'
import { CreateCommentDto, GetPostCommentDto } from '@/modules/post/dto/comment.dto'
import { UsedGoodsCommentService } from '@/modules/used-goods/comment.service'
import {
  GoodsCreateCommentDto,
  GoodsGetCommentDto,
} from '@/modules/used-goods/dto/comment.dto'
import { UsedGoodsSearchQuery } from '@/modules/used-goods/dto/search.dto'
import { RealIp, RealIP } from 'nestjs-real-ip'

@Controller('used-goods')
export class UsedGoodsController {
  @Inject()
  private readonly service: UsedGoodsService

  @Inject()
  private readonly commentService: UsedGoodsCommentService

  @Post('/create')
  create(@Body() dto: UsedGoodsCreateDto, @User() user: IUser) {
    return this.service.create(dto, user)
  }

  @Get('/list')
  getList(@Query() query: GetUsedGoodsListQuery, @User() user: IUser) {
    return this.service.getList(query, user)
  }

  @Post('/hidden')
  hidden(@Query() query: HiddenUsedGoodsQuery, @User() user: IUser) {
    return this.service.hidden(query, user)
  }

  @Get('/detail')
  getDetail(@Query() query: GetUsedGoodsDetailQuery, @User() user: IUser) {
    return this.service.getDetail(query, user)
  }

  @Get('/list/category')
  getListByCategory(
    @Query() query: GetUsedGoodsListByCategoryQuery,
    @User() user: IUser,
  ) {
    return this.service.getListByCategory(query, user)
  }

  @Post('/collect')
  collectGoods(@Body() dto: CollectUsedGoodsDto, @User() user: IUser) {
    return this.service.collectGoods(dto, user)
  }

  @Delete('/collect')
  deleteCollectGoods(@Body() dto: CollectUsedGoodsDto, @User() user: IUser) {
    return this.service.deleteCollectGoods(dto, user)
  }

  @Get('/collect/list')
  getCollectedList(@Query() query: GetCollectedUsedGoodsListQuery, @User() user: IUser) {
    return this.service.getCollectedGoodsList(query, user)
  }

  @Get('/user/other-list')
  getOtherUserGoodsList(@Query() query: GetOtherUserUsedGoodsList, @User() user: IUser) {
    return this.service.getOtherUserGoodsList(query, user)
  }

  @Get('/user/list')
  getUserGoodsList(@Query() query: GetUserUsedGoodsListQuery, @User() user: IUser) {
    return this.service.getUserGoodsList(query, user)
  }

  @Post('/edit')
  editUsedGoods(@Body() dto: EditUsedGoods, @User() user: IUser) {
    return this.service.editGoods(dto, user)
  }

  // comment

  @Post('/comment')
  comment(
    @Body() body: GoodsCreateCommentDto,
    @User() user: IUser,
    @RealIp() ip: string,
  ) {
    return this.commentService.createComment(body, user, ip)
  }

  @Get('/comment')
  getComment(@Query() query: GoodsGetCommentDto, @User() user: IUser) {
    console.log(query)
    return this.commentService.getComment(query, user)
  }

  @Get('/search')
  search(@Query() query: UsedGoodsSearchQuery, @User() user: IUser) {
    return this.service.search(query, user)
  }
}
