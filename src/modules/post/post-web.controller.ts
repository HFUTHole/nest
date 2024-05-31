import { Controller, Get, Inject, Query } from '@nestjs/common'
import { GetPostDetailQuery } from '@/modules/post/dto/post.dto'
import { PostWebService } from '@/modules/post/service/post-web.service'
import { Public } from '@/common/decorator/public.decorator'
import { GetPostCommentDto } from '@/modules/post/dto/comment.dto'

@Controller('post-web')
export class PostWebController {
  @Inject()
  private readonly service: PostWebService

  @Public()
  @Get('/detail')
  getDetail(@Query() query: GetPostDetailQuery) {
    return this.service.getDetail(query)
  }

  @Public()
  @Get('/comment')
  getComment(@Query() query: GetPostCommentDto) {
    return this.service.getComment(query)
  }
}
