import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { Notify, NotifyEvent, NotifyStatus } from '@/entity/notify/notify.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { paginate } from 'nestjs-typeorm-paginate'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Injectable()
export class NotifyService {
  @InjectRepository(Notify)
  private readonly notifyRepo: Repository<Notify>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async notify(
    event: NotifyEvent,
    message: string,
    studentId: number,
    targetId: string | number,
    transactionManager?: EntityManager,
  ) {
    const user = await this.userRepo.findOneBy({ studentId })

    const notify = this.notifyRepo.create({
      event,
      message,
      targetId,
      user,
    })

    const repo = transactionManager
      ? transactionManager.getRepository(Notify)
      : this.notifyRepo

    await repo.save(notify)

    return true
  }

  async getUserNotifications(query: PaginateQuery, studentId: number) {
    return paginate<Notify>(this.notifyRepo, query, {
      relations: {
        user: true,
      },
      where: { user: { studentId } },
      order: {
        createAt: 'DESC',
      },
    })
  }

  async readNotification(id: string, studentId: number) {
    const notification = await this.notifyRepo.findOne({
      relations: { user: true },
      select: {
        user: {
          studentId: true,
        },
      },
      where: { id },
    })

    const isReqUserNotification = notification.user.studentId === studentId

    if (!isReqUserNotification) {
      throw new ForbiddenException('这不是你的消息哦')
    }

    const isAlreadyRead = notification.status === NotifyStatus.read

    if (isAlreadyRead) {
      throw new ConflictException('这条消息已经读过了')
    }

    await this.notifyRepo.update({ id }, { status: NotifyStatus.read })

    return true
  }
}
