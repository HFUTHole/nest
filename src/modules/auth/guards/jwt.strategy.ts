import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { UserService } from '@/modules/user/user.service'
import { AppConfig } from '@/app.config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject()
  private readonly userService: UserService

  constructor(private readonly config: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.token,
    })
  }

  async validate(payload: { studentId: number }) {
    const { studentId } = payload

    const user = await this.userService.findOne({
      studentId
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    return payload
  }
}
