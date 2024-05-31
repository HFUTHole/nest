import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { UsedGoodsCategoryEntity } from '@/entity/used-goods/used-goods-category.entity'
import { UsedGoodsController } from './used-goods.controller';
import { UsedGoodsService } from './used-goods.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsedGoodsEntity, UsedGoodsCategoryEntity])],
  controllers: [UsedGoodsController],
  providers: [UsedGoodsService],
})
export class UsedGoodsModule {}
