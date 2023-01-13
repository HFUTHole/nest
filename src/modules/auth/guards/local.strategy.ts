import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { isString } from 'class-validator'
import { UserService } from '@/modules/user/user.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject()
  private readonly userService: UserService

  constructor() {
    super({
      usernameField: 'studentId',
      passwordField: 'password',
    })
  }

  // 验证是否是第一次登录
  async validate(studentId: number) {
    if (isString(studentId)) {
      throw new NotAcceptableException('学号格式错误')
    }
  }
}
