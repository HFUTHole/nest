import { Module } from '@nestjs/common'
import { format } from 'winston'
import * as winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { WinstonModule } from 'nest-winston'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { LoggerInterceptor } from '@/common/interceptors/logger.interceptor'
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard'
import { RolesGuard } from '@/modules/role/role.guard'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { ThrottlerGuard } from '@nestjs/throttler'
import { Post } from '@/entity/post/post.entity'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, PostCategoryEntity]),
    WinstonModule.forRootAsync({
      useFactory: () => {
        const myFormat = format.printf(({ level, message, label, timestamp }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`
        })

        return {
          level: 'info',
          format: format.combine(format.timestamp(), myFormat, format.colorize()),
          transports: [
            new DailyRotateFile({
              filename: 'logs/%DATE%.log',
              datePattern: 'YYYY-MM-DD',
              maxSize: '30m',
              level: 'info',
            }),
            new DailyRotateFile({
              filename: 'logs/%DATE%.error',
              datePattern: 'YYYY-MM-DD',
              maxSize: '30m',
              level: 'error',
            }),
            new winston.transports.Stream({
              stream: process.stderr,
              level: 'debug',
            }),
          ],
        }
      },
    }),
  ],

  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class CommonModule {}
