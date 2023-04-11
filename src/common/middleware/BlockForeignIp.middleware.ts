import { Inject, Injectable, LoggerService, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { exec } from 'child_process'
import * as IP2Region from '@/common/ip2region/index'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class BlockForeignIpMiddleware implements NestMiddleware {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService

  private readonly blacklistSetName = 'hfuthole'

  private readonly Searcher = IP2Region.newWithFileOnly('ip2region.xdb')

  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip

    // 判断IP是否为国外IP
    const isForeignIp = await this.isForeignIp(ip)
    if (isForeignIp) {
      // 将IP加入黑名单
      await this.addToBlacklist(ip)

      res.status(403).send('Forbidden')
      return
    }

    next()
  }

  private async addToBlacklist(ip: string) {
    const command = `ipset add ${this.blacklistSetName} ${ip}`
    const result = await this.Searcher.search(ip)
    this.logger.log(`ip: ${ip} ${result.region} 已被加入黑名单`)
    exec(command)
  }

  private async isForeignIp(ip: string) {
    try {
      const result = await this.Searcher.search(ip)
      return !!result.region.includes('中国')
    } catch (err) {
      this.logger.error(err.stack.toString())
    }
  }
}
