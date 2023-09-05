import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from '@/modules/user/service/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { LocalStrategy } from '@/modules/auth/guards/local.strategy'
import { LocalAuthGuard } from '@/modules/auth/guards/lcoal-auth.guard'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from '@/modules/auth/guards/jwt.strategy'
import { AppConfig } from '@/app.config'
import { JwtModuleOptions } from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { UserLevelEntity } from '@/entity/user/level.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Hole,
      Comment,
      Reply,
      NotifyInteractionEntity,
      NotifySystemEntity,
      UserLevelEntity,
    ]),
    JwtModule.registerAsync({
      useFactory(config: AppConfig): JwtModuleOptions {
        return {
          secret: config.jwt.token,
          signOptions: {
            expiresIn: config.jwt.expired,
          },
        }
      },
      inject: [AppConfig],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    LocalAuthGuard,
    JwtStrategy,
    NotifyService,
  ],
})
export class AuthModule {}
