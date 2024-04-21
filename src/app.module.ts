import { Module } from '@nestjs/common'
import { TypedConfigModule, fileLoader } from 'nest-typed-config'
import { AppConfig } from './app.config'
import { schemeValidator } from '@/common/utils/schemeValidator'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { CommonModule } from '@/common/common.module'
import { PostModule } from './modules/post/post.module'
import { RoleModule } from './modules/role/role.module'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { NotifyModule } from './modules/notify/notify.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ReportModule } from './modules/report/report.module'
import { ChatModule } from './modules/chat/chat.module'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from 'nestjs-prisma'

@Module({
  imports: [
    TypedConfigModule.forRoot({
      schema: AppConfig,
      load: fileLoader(),
      validate: schemeValidator,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(config: AppConfig): TypeOrmModuleOptions {
        return {
          ...config.database,
          logger: 'advanced-console',
          autoLoadEntities: true,
          synchronize: true,
        }
      },
      inject: [AppConfig],
    }),
    RedisModule.forRootAsync({
      useFactory: (config: AppConfig) => {
        return {
          config: config.redis,
        }
      },
      inject: [AppConfig],
    }),
    ThrottlerModule.forRootAsync({
      useFactory({ throttle }: AppConfig) {
        return {
          ...throttle,
        }
      },
      inject: [AppConfig],
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    CommonModule,
    PostModule,
    RoleModule,
    NotifyModule,
    ReportModule,
    ChatModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
