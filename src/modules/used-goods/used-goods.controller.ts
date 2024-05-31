import { Controller, Inject, Post } from '@nestjs/common'
import { UsedGoodsService } from '@/modules/used-goods/used-goods.service'

@Controller('used-goods')
export class UsedGoodsController {
  @Inject()
  private readonly service: UsedGoodsService

  @Post('/create')
  create() {
    return this.service.create()
  }
}
