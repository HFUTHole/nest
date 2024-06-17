import { Controller, Get, HttpException, Inject, Query } from '@nestjs/common'
import { Roles } from '@/common/decorator/roles.decorator'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { PostImgService } from './service/post-img.service'
import { TransferDto } from './dto/transfer.dto'
import { InjectThrottlerOptions } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Reply } from '@/entity/post/reply.entity'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import * as COS from 'cos-nodejs-sdk-v5'
import * as fs from 'fs'
import * as path from 'path'
import axios from 'axios'
import { createResponse } from '@/utils/create'
import { da, sk } from 'date-fns/locale'
import { log } from 'console'


interface UpdateStats {
  totalProblems: number
  totalFixed: number
}

@Roles()
@Controller('/img')
export class PostImgController {
  @Inject()
  private readonly service: PostImgService

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  @InjectRepository(UsedGoodsEntity)
  private readonly usedGoodsRepo: Repository<UsedGoodsEntity>

  private readonly cos = new COS({
    SecretId: '',
    SecretKey: '',
  })

  @Get('/token')
  getToken(@User() user: IUser) {
    return this.service.getToken(user)
  }

  @Get('/transfer')
  async transfer(@Query() query: TransferDto) {
    if (query.password !== '2020217944') {
      return new HttpException('Page Not Found', 404)
    }

    const types = query.types.split(',').map((type) => type.trim())
    const stats: Record<string, UpdateStats> = {}

    if (types.includes('comment')) {
      stats['comment'] = await this.doTransfer(this.commentRepo, query)
    }

    if (types.includes('post')) {
      stats['post'] = await this.doTransfer(this.postRepo, query)
    }

    if (types.includes('reply')) {
      stats['reply'] = await this.doTransfer(this.replyRepo, query)
    }

    if (types.includes('used-goods')) {
      stats['used-goods'] = await this.doTransfer(this.usedGoodsRepo, query)
    }

    return createResponse('处理完毕',stats)
  }

  async doTransfer(repo: Repository<any>, query: TransferDto) {
    let skip = 0
    let take = 20
    let totalProblems = 0
    let totalFixed = 0

    // 分批查询并处理数据
    while (true) {
      const entities = await repo.find({
        skip: skip,
        take: take,
        order: {
          id: 'ASC' // 例如按照id升序排列
        }
      });

      console.log(entities)
      

      if (entities.length === 0) {
        break
      }

      for (const entity of entities) {
        let needsUpdate = false
        const newImgs = []

        for (const img of entity.imgs) {
          // 判断是否为直连
          if (this.isDirectLink(img)) {
            newImgs.push(img)
          } else {
            needsUpdate = true // 标记需要更新
            if (query.fix) {
              // 上传图片到腾讯云OSS并获取新的URL
              const newImgUrl = await this.uploadImageToCos(img)
              newImgs.push(newImgUrl)
            } else {
              newImgs.push(img)
            }
          }
        }

        if (needsUpdate) {
          totalProblems++ // 有问题的记录数加1
        }

        // 更新数据库中的图片字段
        if (query.fix) {
          await repo.update(entity.id, { imgs: newImgs })
          totalFixed++ // 已修复的记录数加1
        }
      }

      skip += take
    }

    return { totalProblems, totalFixed }
  }

  // 判断是否为直连的辅助函数
  isDirectLink(img: string): boolean {
    // 这里根据实际情况判断是否为直连
    return img.startsWith('http') || img.startsWith('https')
  }

  // 上传图片到腾讯云OSS的辅助函数
  async uploadImageToCos(img: string): Promise<string> {
    // 构建完整的图片URL
    const imageUrl = `https://static.xiaofeishu.lnyynet.com/insecure/plain/local:///${img}`
    
    // 下载图片到临时文件
    const tempFilePath = path.join(__dirname, 'temp.jpg')
    const writer = fs.createWriteStream(tempFilePath)
    const response = await axios.get(imageUrl, { responseType: 'stream' })
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        // 图片下载完成后上传到腾讯云OSS
        this.cos.putObject(
          {
            Bucket: 'xiaofeishu-1308266324' /* 必须 */,
            Region: 'ap-shanghai' /* 必须 */,
            Key: img /* 必须 */,
            Body: fs.createReadStream(tempFilePath), // 上传文件对象
          },
          (err, data) => {
            console.log(err || data);
            
            // 删除临时文件
            fs.unlinkSync(tempFilePath)

            if (err) {
              reject(err)
            } else {
              // 构建腾讯云OSS的图片URL并返回
              const cosImageUrl = `https://${data.Location}`
              resolve(cosImageUrl)
            }
          },
        )
      })

      writer.on('error', reject)
    })
  }
}
