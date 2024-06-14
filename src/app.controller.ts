import { Controller, Get } from '@nestjs/common'
import { createResponse } from '@/utils/create'
import { Public } from '@/common/decorator/public.decorator'

@Public()
@Controller('app')
export class AppController {
  @Get('/version')
  async version() {
    return createResponse('获取最新版本号成功', {
      latest_version: '1.0.1',
      latest_url:
        'https://xq261aa61x.feishu.cn/file/IK5fbSt2uoleq2xS5NOc1UKunIh?from=from_copylink',
    })
  }
}
