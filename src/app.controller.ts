import { Controller, Get } from '@nestjs/common'
import { createResponse } from '@/utils/create'

@Controller('app')
export class AppController {
  @Get('/version')
  async version() {
    return createResponse('获取最新版本号成功', {
      latest_version: '1.0.1',
      latest_url:
        'https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/all/JNGjbxYFyoswqExUQiBccXKsnxh',
    })
  }
}
