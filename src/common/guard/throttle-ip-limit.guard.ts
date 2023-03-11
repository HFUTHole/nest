import { ThrottlerGuard } from '@nestjs/throttler'
import { ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class ThrottlerIpLimitGuard extends ThrottlerGuard {
  async canActive(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
