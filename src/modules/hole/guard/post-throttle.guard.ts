import {
  CanActivate,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Request } from 'express'
import { InjectRedis } from '@liaoliaots/nestjs-redis'
import Redis from 'ioredis'
import { isNullable } from '@/utils/is'
import { Reflector } from '@nestjs/core'
import { AppConfig } from '@/app.config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectLogger } from '@/utils/decorator'
import { Logger } from 'winston'
import { RoleService } from '@/modules/role/role.service'

@Injectable()
export class HolePostThrottleGuard implements CanActivate {
  @InjectLogger()
  private readonly logger: Logger

  @Inject()
  private readonly roleService: RoleService

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    private readonly reflect: Reflector,
    private readonly config: AppConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request
    const user = request.user

    const isAdmin = await this.roleService.isAdmin(user.studentId)

    if (isAdmin) {
      return true
    }

    const key = `hole_post:${user.studentId}`

    const count = parseInt(await this.redis.get(key))

    if (isNullable(count)) {
      await this.redis.set(key, 1)
    } else {
      if (count === this.config.hole.oneDayLimitCreateCount) {
        throw new ConflictException(
          `一天最多只能创建${this.config.hole.oneDayLimitCreateCount}个帖子哦`,
        )
      }

      await this.redis.incr(key)
    }

    return true
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async clearLimit() {
    try {
      const allKeys = await this.redis.keys('hole_post:*')
      if (allKeys.length) {
        await this.redis.del(allKeys)
        this.logger.log({
          message: '成功清除所有用户帖子发表次数限制',
          level: 'logger',
        })
      }
    } catch (error) {
      this.logger.error(error)
    }
  }
}
