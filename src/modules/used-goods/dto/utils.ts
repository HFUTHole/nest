import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { createClassValidator } from '@/utils/create'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUsedGoodsCategoryExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(UsedGoodsCategoryEntity)
  private readonly usedGoodsCategoryRepo: Repository<UsedGoodsCategoryEntity>

  async validate(name: string) {
    const post = await this.usedGoodsCategoryRepo.findOneBy({ name })

    if (!post) {
      throw new NotFoundException('分类不存在哦')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUsedGoodsExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(UsedGoodsEntity)
  private readonly usedGoodsRepo: Repository<UsedGoodsEntity>

  async validate(id: string) {
    const post = await this.usedGoodsRepo.findOneBy({ id })

    if (!post) {
      throw new NotFoundException('商品不存在哦')
    }

    return true
  }
}

export const IsUsedGoodsCategoryExist = createClassValidator(
  IsUsedGoodsCategoryExistConstraint,
)

export const IsUsedGoodsExist = createClassValidator(IsUsedGoodsExistConstraint)
