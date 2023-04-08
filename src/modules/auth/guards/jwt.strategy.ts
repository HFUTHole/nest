import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AppConfig } from '@/app.config'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  constructor(private readonly config: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.token,
    })
  }

  async validate(payload: { studentId: number }) {
    const { studentId } = payload

    const user = await this.userRepo.findOne({
      where: { studentId },
    })

    if (!user) {
      throw new UnauthorizedException('用户不存在')
    }

    return payload
  }
}
