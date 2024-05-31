import { Controller, Get, Inject, Query } from '@nestjs/common'
import { PostService } from '@/modules/post/service/post.service'
import { GetPostDetailQuery } from '@/modules/post/dto/post.dto'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { PostWebService } from '@/modules/post/service/post-web.service'
import { Public } from '@/common/decorator/public.decorator'

@Controller('post-web')
export class PostWebController {
  @Inject()
  private readonly service: PostWebService

  @Public()
  @Get('/detail')
  getDetail(@Query() query: GetPostDetailQuery) {
    return this.service.getDetail(query)
  }
}
