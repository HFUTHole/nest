import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import {
  CreateInteractionNotifyInterface,
  CreateSystemNotifyInterface,
} from '@/modules/notify/interface/params.interface'
import { IUser } from '@/app'
import { ReadNotifyDto } from '@/modules/notify/dtos/notify.dto'

@Injectable()
export class NotifyService {
  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async createInteractionNotify(params: CreateInteractionNotifyInterface) {
    const { type, body, reqUser, recipientId } = params

    const creator = await this.userRepo.findOneBy({ studentId: reqUser.studentId })
    const user = await this.userRepo.findOneBy({ studentId: recipientId })

    const notify = this.notifyInteractionRepo.create({
      type,
      body,
      creator,
      user,
    })

    await this.notifyInteractionRepo.save(notify)

    return true
  }

  async createSystemNotify(params: CreateSystemNotifyInterface) {
    const { userId, body, title } = params

    const notify = this.notifySystemRepo.create({
      title,
      body,
      user: this.userRepo.create({ studentId: userId }),
    })

    await this.notifySystemRepo.save(notify)

    return true
  }

  async getUserBaseNotifications({ studentId }: IUser) {
    const latestInteractionNotify = await this.notifyInteractionRepo.findOne({
      where: {
        user: { studentId },
        isRead: false,
      },
      order: {
        createAt: 'desc',
      },
    })
    const interactionCount = await this.notifyInteractionRepo.count({
      where: {
        user: { studentId },
        isRead: false,
      },
    })

    const latestSystemNotify = await this.notifySystemRepo.findOne({
      where: {
        user: { studentId },
        isRead: false,
      },
      order: {
        createAt: 'desc',
      },
    })
    const systemCount = await this.notifySystemRepo.count({
      where: {
        user: { studentId },
        isRead: false,
      },
    })

    return {
      interaction: {
        data: latestInteractionNotify,
        totalCount: interactionCount,
      },
      system: {
        data: latestSystemNotify,
        totalCount: systemCount,
      },
    }
  }

  async getSystemNotify() {}

  async getInteractionNotify() {}

  async readInteractionNotification(dto: ReadNotifyDto, reqUser: IUser) {
    return this.processReadNotify(this.notifyInteractionRepo, dto.id, reqUser.studentId)
  }

  async readSystemNotification(dto: ReadNotifyDto, reqUser: IUser) {
    return this.processReadNotify(this.notifySystemRepo, dto.id, reqUser.studentId)
  }

  async processReadNotify(
    repo: Repository<NotifyInteractionEntity | NotifySystemEntity>,
    id: string,
    studentId: number,
  ) {
    const notify = await repo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id },
    })

    if (notify.user.studentId !== studentId) {
      throw new ForbiddenException('这不是你的通知')
    }

    if (notify.isRead) {
      throw new ConflictException('这个通知已经读过了哦')
    }

    notify.isRead = true

    await this.notifyInteractionRepo.save(notify)
  }
}
