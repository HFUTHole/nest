import { Injectable } from '@nestjs/common'
import { GetPostDetailQuery } from '@/modules/post/dto/post.dto'
import { IUser } from '@/app'
import { resolveEntityImgUrl } from '@/modules/post/post.utils'
import { createResponse } from '@/utils/create'
import { AppConfig } from '@/app.config'
import { InjectRepository } from '@nestjs/typeorm'
import { Post } from '@/entity/post/post.entity'
import { Repository } from 'typeorm'

@Injectable()
export class PostWebService {
  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  constructor(private readonly appConfig: AppConfig) {}

  async getDetail(query: GetPostDetailQuery) {
    const data = await this.postRepo
      .createQueryBuilder('post')
      .setFindOptions({
        relations: {
          user: true,
        },
        where: {
          id: query.id,
        },
        select: {
          user: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('post.commentCounts', 'post.comments')
      .getOne()

    resolveEntityImgUrl(this.appConfig, data, {
      quality: 70,
    })

    return createResponse('获取树洞详情成功', data as any)
  }
}
