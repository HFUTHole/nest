import { Body, Controller, Delete, Get, Inject, Post, Query } from '@nestjs/common'
import { UsedGoodsService } from '@/modules/used-goods/used-goods.service'
import { UsedGoodsCreateDto } from '@/modules/used-goods/dto/create.dto'
import { IUser } from '@/app'
import { User } from '@/common/decorator/user.decorator'
import {
  GetCollectedUsedGoodsListQuery,
  GetOtherUserUsedGoodsList,
  GetUsedGoodsListByCategoryQuery,
  GetUsedGoodsListQuery,
} from '@/modules/used-goods/dto/getList.dto'
import { CollectUsedGoodsDto } from '@/modules/used-goods/dto/collect.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { EditUsedGoods } from '@/modules/used-goods/dto/post.dto'

@Controller('used-goods')
export class UsedGoodsController {
  @Inject()
  private readonly service: UsedGoodsService

  @Post('/create')
  create(@Body() dto: UsedGoodsCreateDto, @User() user: IUser) {
    return this.service.create(dto, user)
  }

  @Get('/list')
  getList(@Query() query: GetUsedGoodsListQuery, @User() user: IUser) {
    return this.service.getList(query, user)
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
  getUserGoodsList(@Query() query: PaginateQuery, @User() user: IUser) {
    return this.service.getUserGoodsList(query, user)
  }

  @Post('/edit')
  editUsedGoods(@Body() dto: EditUsedGoods, @User() user: IUser) {
    return this.service.editGoods(dto, user)
  }
}
