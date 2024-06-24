import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { UsedGoodsCreateDto } from '@/modules/used-goods/dto/create.dto'
import { IUser } from '@/app'
import { InjectRepository } from '@nestjs/typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { Like, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { createResponse } from '@/utils/create'
import { UsedGoodsStatusEnum } from '@/common/enums/used-goods/use-goods-status.enum'
import {
  GetCollectedUsedGoodsListQuery,
  GetOtherUserUsedGoodsList,
  GetUsedGoodsListByCategoryQuery,
  GetUsedGoodsListQuery,
  GetUserUsedGoodsListQuery,
} from '@/modules/used-goods/dto/getList.dto'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { CollectUsedGoodsDto } from '@/modules/used-goods/dto/collect.dto'
import { NotifyService } from '@/modules/notify/notify.service'
import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { EditUsedGoods } from '@/modules/used-goods/dto/post.dto'
import {
  GetUsedGoodsDetailQuery,
  HiddenUsedGoodsQuery,
} from '@/modules/used-goods/dto/detail.dto'
import { resolveEntityImgUrl } from '@/modules/post/post.utils'
import { AppConfig } from '@/app.config'
import { UsedGoodsSearchQuery } from '@/modules/used-goods/dto/search.dto'
import { isNullable } from '@/utils/is'
import { SchoolAreaEnum } from '@/common/enums/school-area.enum'

@Injectable()
export class UsedGoodsService {
  @InjectRepository(UsedGoodsEntity)
  private readonly usedGoodsRepo: Repository<UsedGoodsEntity>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(UsedGoodsCategoryEntity)
  private readonly usedGoodsCategoryRepo: Repository<UsedGoodsCategoryEntity>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(private readonly appConfig: AppConfig) {}

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
      .createQueryBuilder('goods')
      .setFindOptions({
        relations: {
          creator: true,
        },
        order: {
          createAt: 'desc',
        },
        where: {
          status: UsedGoodsStatusEnum.ok,
          isHidden: false,
        },
      })
      .loadRelationCountAndMap(
        'goods.collectorCounts',
        'goods.collector',
        'collectorCounts',
      )
    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    data.items.map((item) => {
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 40,
      })
    })

    return createResponse('获取成功', data)
  }

  async getDetail(query: GetUsedGoodsDetailQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo.createQueryBuilder('goods').setFindOptions({
      relations: {
        creator: true,
        category: true,
      },
      where: {
        id: query.id,
      },
    })

    queryBuilder
      .leftJoin('goods.collector', 'collector')
      .loadRelationCountAndMap(
        'goods.isCollected',
        'goods.collector',
        'isCollected',
        (qb) =>
          qb.andWhere('isCollected.id = :id', {
            id: reqUser.id,
          }),
      )
      .loadRelationCountAndMap(
        'goods.collectorCounts',
        'goods.collector',
        'collectorCounts',
      )
      .loadRelationCountAndMap('goods.commentsCount', 'goods.comments')

    const data = await queryBuilder.getOne()

    await this.usedGoodsRepo
      .createQueryBuilder('goods')
      .update(data)
      .set({ views: () => 'views + 1' })
      .execute()

    resolveEntityImgUrl(this.appConfig, data, {
      quality: 70,
    })

    return createResponse('获取成功', data)
  }

  async getListByCategory(query: GetUsedGoodsListByCategoryQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo
      .createQueryBuilder('goods')
      .setFindOptions({
        relations: {
          creator: true,
          category: true,
        },
        order: {
          createAt: 'desc',
        },
        where: {
          ...(query.category && {
            category: {
              name: query.category,
            },
          }),
          ...(query.area &&
            query.area !== SchoolAreaEnum.all && {
              area: query.area,
            }),
          status: UsedGoodsStatusEnum.ok,
        },
      })
      .loadRelationCountAndMap(
        'goods.collectorCounts',
        'goods.collector',
        'collectorCounts',
      )

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    data.items.map((item) => {
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 40,
      })
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

    const collectGoods = await this.usedGoodsRepo.findOne({
      relations: {
        creator: true,
      },
      where: {
        id: dto.id,
      },
      select: {
        creator: {
          studentId: true,
        },
      },
    })

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

    await this.notifyService.createInteractionNotify({
      type: NotifyEventType.collect,
      reqUser: reqUser,
      recipientId: collectGoods.creator.studentId,
      target: InteractionNotifyTargetType.usedGoods,
      usedGoodsId: dto.id,
      body: '收藏了你的商品',
    })

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
    const queryBuilder = this.usedGoodsRepo
      .createQueryBuilder('goods')
      .setFindOptions({
        relations: {
          creator: true,
        },
        where: {
          collector: {
            id: reqUser.id,
          },
        },
        order: {
          createAt: 'desc',
        },
      })
      .loadRelationCountAndMap(
        'goods.collectorCounts',
        'goods.collector',
        'collectorCounts',
      )

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    data.items.map((item) => {
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 40,
      })
    })

    return createResponse('获取收藏成功', data)
  }

  async getOtherUserGoodsList(query: GetOtherUserUsedGoodsList, user: IUser) {
    const queryBuilder = this.usedGoodsRepo.createQueryBuilder('goods').setFindOptions({
      where: {
        creator: {
          // 0确保 where 语句在不穿参时生效
          id: query.userId || 0,
        },
      },
    })

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    data.items.map((item) => {
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 40,
      })
    })

    return createResponse('获取用户发布信息商品', data)
  }

  async getUserGoodsList(query: GetUserUsedGoodsListQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo
      .createQueryBuilder('goods')
      .setFindOptions({
        where: {
          creator: {
            id: reqUser.id,
          },
          status:
            query.type === 'posted'
              ? UsedGoodsStatusEnum.ok
              : UsedGoodsStatusEnum.offline,
        },
        order: {
          createAt: 'desc',
        },
      })
      .loadRelationCountAndMap(
        'goods.collectorCounts',
        'goods.collector',
        'collectorCounts',
      )

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    return createResponse('获取用户发布信息商品', data)
  }

  async editGoods(dto: EditUsedGoods, reqUser: IUser) {
    const hasPermission = await this.usedGoodsRepo.findOne({
      where: {
        id: dto.id,
        creator: {
          id: reqUser.id,
        },
      },
    })

    if (!hasPermission) {
      throw new ForbiddenException('这不是你的商品哦')
    }

    if (dto.area) {
      hasPermission.area = dto.area
    }

    if (dto.category) {
      const category = await this.usedGoodsCategoryRepo.findOne({
        where: {
          name: dto.category,
        },
      })
      hasPermission.category = category!
    }

    if (dto.imgs) {
      hasPermission.imgs = dto.imgs
    }

    if (dto.body) {
      hasPermission.body = dto.body
    }

    if (dto.price) {
      hasPermission.price = dto.price
    }

    if (!isNullable(dto.status)) {
      hasPermission.status = dto.status
    }

    await this.usedGoodsRepo.save(hasPermission)

    return createResponse('修改信息成功', hasPermission)
  }

  async search(query: UsedGoodsSearchQuery, reqUser: IUser) {
    const queryBuilder = this.usedGoodsRepo.createQueryBuilder('goods').setFindOptions({
      relations: {
        creator: true,
      },
      where: {
        body: Like(`%${query.keywords}%`),
        status: UsedGoodsStatusEnum.ok,
        ...(query.area && query.area !== SchoolAreaEnum.all && { area: query.area }),
      },
    })
    queryBuilder.addOrderBy('goods.price', 'DESC')

    if (query.price && query.price !== 'latest') {
      queryBuilder.addOrderBy('goods.price', query.price.toUpperCase() as 'ASC' | 'DESC')
    }

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    data.items.forEach((goods) => {
      resolveEntityImgUrl(this.appConfig, goods, {
        quality: 0.7,
      })
    })

    return createResponse('搜索成功', data)
  }

  async hidden(query: HiddenUsedGoodsQuery, reqUser: IUser) {
    const goods = await this.usedGoodsRepo.findOne({
      where: {
        id: query.id,
      },
    })

    goods.isHidden = true

    await this.usedGoodsRepo.save(goods)

    return createResponse('隐藏成功')
  }
}
