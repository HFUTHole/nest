import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOptionsWhere, Repository } from 'typeorm'
import { UserCreateDto } from '@/modules/user/dtos/user_create.dto'
import { IUser } from '@/app'
import { NotifyService } from '@/modules/notify/notify.service'
import { createResponse } from '@/utils/create'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @Inject()
  private readonly notifyService: NotifyService

  async getNotifications(query: PaginateQuery, reqUser: IUser) {
    const data = await this.notifyService.getUserNotifications(query, reqUser.studentId)

    return createResponse('获取通知成功', data)
  }

  async readNotify() {}
}
