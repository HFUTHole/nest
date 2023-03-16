import { ValidatorConstraint } from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Notify } from '@/entity/notify/notify.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import { User } from '@/entity/user/user.entity'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNotificationExistConstraint {
  @InjectRepository(Notify)
  private readonly notifyRepo: Repository<Notify>

  async validate(id: string) {
    const notify = await this.notifyRepo.findOne({
      where: {
        id,
      },
    })

    if (!notify) {
      throw new NotFoundException('通知不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUserExistConstraint {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async validate(id: number) {
    const notify = await this.userRepo.findOne({
      where: {
        id,
      },
    })

    if (!notify) {
      throw new NotFoundException('该用户不存在')
    }

    return true
  }
}

export const IsUserExist = createClassValidator(IsUserExistConstraint)

export const IsNotifyExist = createClassValidator(IsNotificationExistConstraint)
