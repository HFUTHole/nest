import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { UsedGoodsController } from './used-goods.controller'
import { UsedGoodsService } from './used-goods.service'
import { User } from '@/entity/user/user.entity'
import {
  IsUsedGoodsCategoryExistConstraint,
  IsUsedGoodsExistConstraint,
} from '@/modules/used-goods/dto/utils'

@Module({
  imports: [TypeOrmModule.forFeature([UsedGoodsEntity, UsedGoodsCategoryEntity, User])],
  controllers: [UsedGoodsController],
  providers: [
    UsedGoodsService,
    IsUsedGoodsCategoryExistConstraint,
    IsUsedGoodsExistConstraint,
  ],
})
export class UsedGoodsModule {}
