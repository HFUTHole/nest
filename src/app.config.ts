import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ValidationPipeOptions } from '@nestjs/common'

export class AppConfig {
  database!: TypeOrmModuleOptions

  validations!: ValidationPipeOptions

  jwt!: {
    token: string
    expired: string
  }

  post!: {
    oneDayLimitCreateCount: number
  }

  server!: {
    port: number
  }

  throttle!: {
    ttl: number
    limit: number
  }

  user!: {
    avatar: string
  }

  image!: {
    url: string
  }

  redis!: {
    host
  }

  hfut!: {
    url: string
  }
}
