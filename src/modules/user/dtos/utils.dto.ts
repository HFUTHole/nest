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

export const IsUserExist = createClassValidator(IsUserExistConstraint)
