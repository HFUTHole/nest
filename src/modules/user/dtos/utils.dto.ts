import { ValidatorConstraint } from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Notify } from '@/entity/notify/notify.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'

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

export const IsNotifyExist = createClassValidator(IsNotificationExistConstraint)
