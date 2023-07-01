import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { ConversationEntity } from '@/entity/chat/conversation.entity'
import { MessageEntity } from '@/entity/chat/message.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, MessageEntity, User])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
