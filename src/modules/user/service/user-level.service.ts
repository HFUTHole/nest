import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { EntityManager, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { getCurrentLevelByRangeExperience } from '@/constants/level'

@Injectable()
export class UserLevelService {
  @InjectRepository(UserLevelEntity)
  private readonly userLevelRepo: Repository<UserLevelEntity>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async incExperience(
    payload: { increment: number; studentId: number },
    transaction?: EntityManager,
  ) {
    const userLevel = await this.userLevelRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        user: {
          studentId: payload.studentId,
        },
      },
    })

    const afterSum = payload.increment + userLevel.experience

    const canUpToNextLevel = afterSum >= userLevel.nextLevelRequiredExperience

    if (canUpToNextLevel) {
      const nextLevel = getCurrentLevelByRangeExperience(afterSum)
      userLevel.level = nextLevel.level
      userLevel.nextLevelRequiredExperience = nextLevel.nextRequiredExperience
    }

    userLevel.experience = afterSum

    const repo = transaction || this.userLevelRepo

    await (repo as Repository<UserLevelEntity>).save(userLevel)
  }
}
