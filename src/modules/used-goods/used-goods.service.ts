import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { UsedGoodsCreateDto } from '@/modules/used-goods/dto/create.dto'
import { IUser } from '@/app'
import { InjectRepository } from '@nestjs/typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { createResponse } from '@/utils/create'
import { UsedGoodsStatusEnum } from '@/common/enums/used-goods/use-goods-status.enum'
import {
  GetCollectedUsedGoodsListQuery,
  GetUsedGoodsListByCategoryQuery,
  GetUsedGoodsListQuery,
} from '@/modules/used-goods/dto/getList.dto'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { CollectUsedGoodsDto } from '@/modules/used-goods/dto/collect.dto'

@Injectable()
export class UsedGoodsService {
  @InjectRepository(UsedGoodsEntity)
  private readonly usedGoodsRepo: Repository<UsedGoodsEntity>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(UsedGoodsCategoryEntity)
  private readonly usedGoodsCategoryRepo: Repository<UsedGoodsCategoryEntity>

  async create(dto: UsedGoodsCreateDto, reqUser: IUser) {
    const category = await this.usedGoodsCategoryRepo.findOne({
      where: {
        name: dto.category,
      },
    })

    if (!category) {
      throw new NotFoundException('商品分类不存在')
    }

    const goods = this.usedGoodsRepo.create({
      area: dto.area,
      body: dto.body,
      imgs: dto.imgs,
      price: dto.price,
      collector: [],
      creator: this.userRepo.create({
        id: reqUser.id,
      }),
      category,
      status: UsedGoodsStatusEnum.ok,
    })

    const data = await this.usedGoodsRepo.save(goods)

    return createResponse('创建商品成功', data)
  }

  async getList(query: GetUsedGoodsListQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo
      .createQueryBuilder('usedGoods')
      .setFindOptions({
        relations: {
          creator: true,
        },
        order: {
          createAt: 'desc',
        },
      })
      .loadRelationCountAndMap('usedGoods.collector', 'usedGoods.collector')

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    return createResponse('获取成功', data)
  }

  async getListByCategory(query: GetUsedGoodsListByCategoryQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo
      .createQueryBuilder('usedGoods')
      .setFindOptions({
        relations: {
          creator: true,
          category: true,
        },
        order: {
          createAt: 'desc',
        },
        where: {
          category: {
            name: query.category,
          },
        },
      })

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    return createResponse('获取成功', data)
  }

  async collectGoods(dto: CollectUsedGoodsDto, reqUser: IUser) {
    const isCollected = await this.usedGoodsRepo.findOne({
      relations: {
        collector: true,
      },
      where: {
        id: dto.id,
        collector: {
          id: reqUser.id,
        },
      },
    })

    if (isCollected) {
      throw new ConflictException('这个商品已经收藏过啦~')
    }

    const user = await this.userRepo.findOne({
      relations: {
        collectedUsedGoods: true,
      },
      where: {
        id: reqUser.id,
      },
    })

    if (!user.collectedUsedGoods) {
      user.collectedUsedGoods = []
    }

    user.collectedUsedGoods.push(
      this.usedGoodsRepo.create({
        id: dto.id,
      }),
    )

    await this.userRepo.save(user)

    return createResponse('收藏商品成功')
  }

  async deleteCollectGoods(dto: CollectUsedGoodsDto, reqUser: IUser) {
    const isCollected = await this.usedGoodsRepo.findOne({
      relations: {
        collector: true,
      },
      where: {
        id: dto.id,
        collector: {
          id: reqUser.id,
        },
      },
    })

    if (!isCollected) {
      throw new ConflictException('这个商品还没有收藏过哦~')
    }

    const goods = await this.usedGoodsRepo.findOne({
      relations: {
        collector: true,
      },
      where: {
        id: dto.id,
      },
    })

    const user = await this.userRepo.findOne({
      where: {
        id: reqUser.id,
      },
    })

    await this.userRepo
      .createQueryBuilder('user')
      .relation(User, 'collectedUsedGoods')
      .of(user)
      .remove(goods)

    return createResponse('取消收藏成功')
  }

  async getCollectedGoodsList(query: GetCollectedUsedGoodsListQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo.createQueryBuilder('goods').setFindOptions({
      relations: {
        creator: true,
      },
      where: {
        collector: {
          id: reqUser.id,
        },
      },
    })

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    return createResponse('获取收藏成功', data)
  }
}
