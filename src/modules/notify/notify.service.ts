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
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'

@Injectable()
export class NotifyService {
  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async createInteractionNotify(params: CreateInteractionNotifyInterface) {
    // const { type, body, reqUser, recipientId } = params
    //
    // const notify = this.notifyInteractionRepo.create({
    //   type,
    //   body,
    //   creator: {
    //     studentId: reqUser.studentId
    //   },
    //   user: {
    //     studentId: recipientId
    //   },
    // })
    //
    // if (params.postId) {
    //   notify.post = this.postRepo.create({
    //     id: params.postId,
    //   })
    // } else if (params.commentId) {
    //   const comment = await this.commentRepo.findOne({
    //     relations: { post: true },
    //     where: {
    //       id: params.commentId,
    //     },
    //   })
    //
    //   notify.comment = comment
    //   notify.post = comment.post
    // } else if (params.replyId) {
    //   const reply = await this.replyRepo.findOne({
    //     relations: { comment: true },
    //     where: {
    //       id: params.replyId,
    //     },
    //   })
    //   notify.post = (
    //     await this.commentRepo.findOne({
    //       relations: { post: true },
    //       where: {
    //         id: reply.comment.id,
    //       },
    //     })
    //   ).post
    //   notify.comment = reply.comment
    //   notify.reply = reply
    // }
    //
    // await this.notifyInteractionRepo.save(notify)
    //
    // return true
  }

  async createSystemNotify(params: CreateSystemNotifyDto) {
    const notify = this.notifySystemRepo.create({
      title: params.title,
      body: params.body,
      completedReadingUsers: [],
    })

    const saved = await this.notifySystemRepo.save(notify)

    return createResponse('系统通知发布成功', saved)
  }

  async getUserBaseNotifications({ id }: IUser) {
    const latestInteractionNotify = await this.notifyInteractionRepo.findOne({
      where: {
        user: { id },
        isRead: false,
      },
      order: {
        createAt: 'desc',
      },
    })

    const interactionCount = await this.notifyInteractionRepo.count({
      where: {
        user: { id },
        isRead: false,
      },
    })

    const latestSystemNotification = await this.notifySystemRepo.find({
      relations: {
        completedReadingUsers: true,
      },
      where: {
        completedReadingUsers: {},
      },
    })

    return {
      interaction: {
        data: latestInteractionNotify,
        totalCount: interactionCount,
      },
      system: {
        data: latestSystemNotification,
        totalCount: latestSystemNotification.length,
      },
    }
  }

  async getSystemNotifications(query: PaginateQuery, reqUser: IUser) {
    const notifyBuilder = this.notifySystemRepo
      .createQueryBuilder('system')
      .setFindOptions({})

    return createResponse('获取成功')
  }

  async getInteractionNotifications(query: PaginateQuery, reqUser: IUser) {
    const queryBuilder = this.notifyInteractionRepo
      .createQueryBuilder('notify')
      .setFindOptions({
        relations: {
          creator: true,
          post: true,
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
    //     user: { id: reqUser.id },
    //   },
    // })

    return createResponse('读取成功')
  }

  async readInteractionNotification(dto: ReadNotifyDto, reqUser: IUser) {
    const notify = await this.notifyInteractionRepo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })

    if (notify.user.studentId !== reqUser.studentId) {
      throw new ForbiddenException('这不是你的通知')
    }

    if (notify.isRead) {
      throw new ConflictException('这个通知已经读过了哦')
    }

    notify.isRead = true

    await this.notifyInteractionRepo.save(notify)
  }

  async readSystemNotification(dto: ReadNotifyDto, reqUser: IUser) {
    // return this.processReadNotify(this.notifySystemRepo, dto.id, reqUser.studentId)
  }
}
