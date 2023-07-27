import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, IsNull, Not, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { CreateInteractionNotifyInterface } from '@/modules/notify/interface/params.interface'
import { IUser } from '@/app'
import { CreateSystemNotifyDto, ReadNotifyDto } from '@/modules/notify/dtos/notify.dto'
import { PaginateQuery } from '@/common/dtos/paginate.dto'
import { paginate } from 'nestjs-typeorm-paginate'
import { createResponse } from '@/utils/create'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'

@Injectable()
export class NotifyService {
  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

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

    if (params.holeId) {
      notify.hole = this.holeRepo.create({
        id: params.holeId,
      })
    } else if (params.commentId) {
      const comment = await this.commentRepo.findOne({
        relations: { hole: true },
        where: {
          id: params.commentId,
        },
      })

      notify.comment = comment
      notify.hole = comment.hole
    } else if (params.replyId) {
      const reply = await this.replyRepo.findOne({
        relations: { comment: true },
        where: {
          id: params.replyId,
        },
      })
      notify.hole = (
        await this.commentRepo.findOne({
          relations: { hole: true },
          where: {
            id: reply.comment.id,
          },
        })
      ).hole
      notify.comment = reply.comment
      notify.reply = reply
    }

    await this.notifyInteractionRepo.save(notify)

    return true
  }

  async createSystemNotify(params: CreateSystemNotifyDto) {
    const { userId, body, title, holeId, replyId, commentId } = params

    const notify = this.notifySystemRepo.create({
      title,
      body,
    })

    if (userId) {
      notify.user = await this.userRepo.findOneBy({ studentId: userId })
      if (!notify.completedReadingUsers) {
        notify.completedReadingUsers = []
      }
    }

    if (holeId) {
      notify.hole = this.holeRepo.create({
        id: params.holeId,
      })
    } else if (commentId) {
      const comment = await this.commentRepo.findOne({
        relations: { hole: true },
        where: {
          id: params.commentId,
        },
      })

      notify.comment = comment
      notify.hole = comment.hole
    } else if (replyId) {
      const reply = await this.replyRepo.findOne({
        relations: { comment: true },
        where: {
          id: params.replyId,
        },
      })
      notify.hole = (
        await this.commentRepo.findOne({
          relations: { hole: true },
          where: {
            id: reply.comment.id,
          },
        })
      ).hole
    }

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

    const [latestSystemNotify, systemCount] = await this.notifySystemRepo
      .createQueryBuilder('notify')
      .setFindOptions({
        where: {
          isRead: false,
        },
        order: {
          createAt: 'desc',
        },
      })
      .getManyAndCount()

    return {
      interaction: {
        data: latestInteractionNotify,
        totalCount: interactionCount,
      },
      system: {
        data: latestSystemNotify?.[0] || null,
        totalCount: systemCount,
      },
    }
  }

  async getSystemNotifications(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.notifySystemRepo
      .createQueryBuilder('notify')
      .setFindOptions({
        relations: {
          hole: true,
          comment: true,
          reply: true,
        },
        where: [
          {
            user: {
              studentId: reqUser.studentId,
            },
          },
          {
            user: IsNull(),
          },
        ],
        order: {
          createAt: 'DESC',
        },
      })

    const data = await paginate(queryBuilder, query)

    return createResponse('获取成功', data)
  }

  async getInteractionNotifications(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.notifyInteractionRepo
      .createQueryBuilder('notify')
      .setFindOptions({
        relations: {
          creator: true,
          hole: true,
          comment: true,
          reply: true,
        },
        where: {
          user: { studentId: reqUser.studentId },
        },
        order: {
          createAt: 'DESC',
        },
      })

    const data = await paginate(queryBuilder, query)

    return createResponse('获取成功', data)
  }

  async readAllInteractionNotification(reqUser: IUser) {
    const allInteractions = await this.notifyInteractionRepo.find({
      relations: { user: true },
      where: {
        user: { studentId: reqUser.studentId },
      },
    })

    await this.notifyInteractionRepo.update(
      {
        id: In(allInteractions.map((item) => item.id)),
      },
      {
        isRead: true,
      },
    )

    return createResponse('读取成功')
  }

  // TODO 日后在做
  async readAllSystemNotification(reqUser: IUser) {
    // const allInteractions = await this.notifyInteractionRepo.find({
    //   relations: { user: true },
    //   where: {
    //     user: { studentId: reqUser.studentId },
    //   },
    // })

    return createResponse('读取成功')
  }

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
