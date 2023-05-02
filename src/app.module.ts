import { Module } from '@nestjs/common'
import { TypedConfigModule, fileLoader } from 'nest-typed-config'
import { AppConfig } from './app.config'
import { schemeValidator } from '@/common/utils/schemeValidator'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { CommonModule } from '@/common/common.module'
import { HoleModule } from './modules/hole/hole.module'
import { RoleModule } from './modules/role/role.module'
import { AppController } from '@/app.controller'
import { AppService } from '@/app.service'
import { NotifyModule } from './modules/notify/notify.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { ReportModule } from './modules/report/report.module';

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
    ThrottlerModule.forRootAsync({
      useFactory({ throttle }: AppConfig) {
        return {
          ...throttle,
        }
      },
      inject: [AppConfig],
    }),
    UserModule,
    AuthModule,
    CommonModule,
    HoleModule,
    RoleModule,
    NotifyModule,
    ReportModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
