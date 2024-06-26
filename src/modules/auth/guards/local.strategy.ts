import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common'
import { isString } from 'class-validator'
import { UserService } from '@/modules/user/service/user.service'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject()
  private readonly userService: UserService

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

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

    const user = await this.userRepo.findOne({
      where: { studentId },
    })

    if (!user) {
      throw new NotFoundException(
        '用户不存在，小肥书不是使用信息门户账号登录，需要注册一下哦~',
      )
    }

    return true
  }
}
