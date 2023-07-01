import { ValidatorConstraint } from 'class-validator'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNotifyExistConstraint {
  @InjectRepository(NotifyInteractionEntity)
  private readonly interactionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(NotifySystemEntity)
  private readonly systemRepo: Repository<NotifySystemEntity>

  async validate(id: string) {
    const result = await Promise.race([
      this.interactionRepo.findOneBy({ id }),
      this.systemRepo.findOneBy({ id }),
    ])

    if (!result) {
      throw new NotFoundException('通知不存在哦')
    }

    return true
  }
}

export const IsNotifyExist = createClassValidator(IsNotifyExistConstraint)
