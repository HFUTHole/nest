import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { RoleService } from '@/modules/role/role.service'
import * as STS from 'qcloud-cos-sts'
import { createResponse } from '@/utils/create'

@Injectable()
export class PostImgService {
  @Inject()
  private readonly roleService: RoleService

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  // 配置参数
  private readonly config = {
    secretId: '', // 固定密钥
    secretKey: '', // 固定密钥
    proxy: '',
    durationSeconds: 1800,
    // host: 'sts.tencentcloudapi.com', // 域名，非必须，默认为 sts.tencentcloudapi.com
    endpoint: 'sts.tencentcloudapi.com', // 域名，非必须，与host二选一，默认为 sts.tencentcloudapi.com
    // 放行判断相关参数
    bucket: 'xiaofeishu-1308266324',
    region: 'ap-shanghai',
    allowPrefix: '*', // 这里改成允许的路径前缀，可以根据自己网站的用户登录态判断允许上传的具体路径，例子： a.jpg 或者 a/* 或者 * (使用通配符*存在重大安全风险, 请谨慎评估使用)
    // 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
    allowActions: [
      // 简单上传
      'name/cos:PutObject',
      'name/cos:PostObject',
    ],
  }

  async getToken(@User() user: IUser) {
    // 管理员可以无限上传，带有学号的一天可以上传10次，其他一天一次
    let id = user.id
    let studentId = user.studentId

    const isAllowUpload = await this.allowUpload(id, studentId)

    if (!isAllowUpload) {
      throw new BadRequestException('今天的图片上传已经达到上限')
    }

    let tempToken = this.getTempToken()

    this.incrTime(id)

    return createResponse(tempToken)
  }

  async allowUpload(id: number, studentId: number) {
    // 管理员可以无限上传
    const isAdmin = await this.roleService.isAdmin(studentId)

    if (isAdmin) {
      return true
    }

    const uploadKey = this.getUploadsKey(id)

    // 获取用户当天的上传次数
    let uploadsToday = parseInt(await this.redis.get(uploadKey), 10) || 0
    // 判断是否有学号和次数限制
    const maxUploads = studentId ? 10 : 1

    if (uploadsToday >= maxUploads) {
      console.log(`图片超额上传 id:${id} 学号:${studentId}`)

      return false
    }

    return true
  }

  getUploadsKey(id: number) {
    const currentDate = new Date().toISOString().split('T')[0]
    const uploadKey = `uploads:${id}:${currentDate}`
    return uploadKey
  }

  getTempToken() {
    // 获取临时密钥
    let shortBucketName = this.config.bucket.substr(
      0,
      this.config.bucket.lastIndexOf('-'),
    )
    let appId = this.config.bucket.substr(1 + this.config.bucket.lastIndexOf('-'))
    let policy = {
      version: '2.0',
      statement: [
        {
          action: this.config.allowActions,
          effect: 'allow',
          principal: { qcs: ['*'] },
          resource: [
            'qcs::cos:' +
              this.config.region +
              ':uid/' +
              appId +
              ':prefix//' +
              appId +
              '/' +
              shortBucketName +
              '/' +
              this.config.allowPrefix,
          ],
          // condition生效条件，关于 condition 的详细设置规则和COS支持的condition类型可以参考https://cloud.tencent.com/document/product/436/71306
          // 'condition': {
          //   // 比如限定ip访问
          //   'ip_equal': {
          //     'qcs:ip': '10.121.2.10/24'
          //   }
          // }
        },
      ],
    }
    let data = null
    STS.getCredential(
      {
        secretId: this.config.secretId,
        secretKey: this.config.secretKey,
        proxy: this.config.proxy,
        durationSeconds: this.config.durationSeconds,
        endpoint: this.config.endpoint,
        policy: policy,
      },
      function (err, tempKeys) {
        if (!err) {
          let result = JSON.stringify(err || tempKeys) || ''
          console.log(result)
          data = result['credentials']
        }

        //res.send(result)
      },
    )
    return data
  }

  async incrTime(id: number) {
    const uploadKey = this.getUploadsKey(id)
    const currentDate = new Date()
    // 没有达到限制，增加上传次数
    await this.redis.incr(uploadKey)
    // 设置键的过期时间为当天的最后一秒

    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + 1,
      0,
      0,
      0,
      -1,
    )
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - Date.now()) / 1000)
    await this.redis.expire(uploadKey, secondsUntilEndOfDay)
  }
}
