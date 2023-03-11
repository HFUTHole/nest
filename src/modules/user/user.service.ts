import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { createResponse } from '@/utils/create'
import { ReadNotifyDto } from '@/modules/user/dtos/notify.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

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
}
