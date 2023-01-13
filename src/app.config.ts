import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ValidationPipeOptions } from '@nestjs/common'

export class AppConfig {
  database: TypeOrmModuleOptions

  validations: ValidationPipeOptions

  jwt: {
    token: string
    expired: string
  }

  server: {
    port: number
  }
}
