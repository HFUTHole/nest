import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { createResponse } from '@/utils/create'
import { ReadNotifyDto } from '@/modules/user/dtos/notify.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { Hole } from '@/entity/hole/hole.entity'
import { paginate } from 'nestjs-typeorm-paginate'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @Inject()
  private readonly notifyService: NotifyService

  async getNotifications(dto: PaginateQuery, reqUser: IUser) {
    const data = await this.notifyService.getUserNotifications(dto, reqUser.studentId)

    return createResponse('获取通知成功', data)
  }

  async readNotify(dto: ReadNotifyDto, reqUser: IUser) {
    await this.notifyService.readNotification(dto.id, reqUser.studentId)

    return createResponse('阅读通知成功')
  }

  async getProfile(reqUser: IUser) {
    const data = await this.userRepository.findOne({
      where: {
        studentId: reqUser.studentId,
      },
      select: {
        role: true,
        avatar: true,
        username: true,
        id: true,
      },
    })

    return createResponse('获取用户信息成功', data)
  }

  async getFavoriteHoles(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.holeRepo.createQueryBuilder('hole').setFindOptions({
      relations: {
        user: true,
      },
      where: {
        favoriteUsers: {
          studentId: reqUser.studentId,
        },
      },
      order: {
        createAt: 'DESC',
      },
    })

    const data = await paginate(queryBuilder, query)

    return createResponse('获取点赞树洞成功', data)
  }

  async getHoleList(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.holeRepo.createQueryBuilder('hole').setFindOptions({
      relations: {
        user: true,
      },
      where: {
        user: {
          studentId: reqUser.studentId,
        },
      },
      order: {
        createAt: 'DESC',
      },
    })

    const data = await paginate(queryBuilder, query)

    return createResponse('获取用户树洞成功', data)
  }
}
