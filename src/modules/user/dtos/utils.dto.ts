import { ValidatorConstraint } from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import { User } from '@/entity/user/user.entity'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserExistConstraint {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async validate(studentId: number) {
    const user = await this.userRepo.findOne({
      where: {
        studentId,
      },
    })

    if (!user) {
      throw new NotFoundException('该用户不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUsernameExistConstraint {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async validate(username: string) {
    const user = await this.userRepo.findOne({
      where: {
        username,
      },
    })

    if (user) {
      throw new NotFoundException('嗨嗨嗨，这个用户名已经被注册了，换个名字吧')
    }

    return true
  }
}

export const IsUserExist = createClassValidator(IsUserExistConstraint)

export const IsUsernameExist = createClassValidator(IsUsernameExistConstraint)
