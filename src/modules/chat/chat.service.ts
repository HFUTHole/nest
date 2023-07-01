import { Injectable } from '@nestjs/common'
import { ChatSendDto } from '@/modules/chat/dtos/send.dto'
import { IUser } from '@/app'
import {
  GetConversationListQuery,
  GetConversationQuery,
} from '@/modules/chat/dtos/conversation.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConversationEntity } from '@/entity/chat/conversation.entity'
import { MessageEntity } from '@/entity/chat/message.entity'
import { User } from '@/entity/user/user.entity'
import { createResponse } from '@/utils/create'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'

@Injectable()
export class ChatService {
  @InjectRepository(ConversationEntity)
  private readonly conversationRepo: Repository<ConversationEntity>

  @InjectRepository(MessageEntity)
  private readonly messageRepo: Repository<MessageEntity>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async getConversationList(query: GetConversationListQuery, reqUser: IUser) {}

  async getConversation(query: GetConversationQuery, reqUser: IUser) {
    const { userId } = query

    const isConversationExist = await this.conversationRepo.findOneBy({
      user: [{ studentId: userId }, { studentId: reqUser.studentId }],
    })

    if (!isConversationExist) {
      const promisesUser = [userId, reqUser.studentId].map(
        async (studentId) =>
          await this.userRepo.findOneBy({
            studentId,
          }),
      )

      const relationUsers = await Promise.all(promisesUser)

      const conversation = this.conversationRepo.create({
        user: relationUsers,
      })

      await this.conversationRepo.save(conversation)
    }

    const queryBuilder = this.conversationRepo
      .createQueryBuilder('conversation')
      .setFindOptions({})

    const result = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    return createResponse('获取对话成功', result)
  }

  async send(dto: ChatSendDto, reqUser: IUser) {}
}
