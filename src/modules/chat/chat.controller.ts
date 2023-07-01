import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  Post,
  Query,
} from '@nestjs/common'
import { ChatSendDto } from '@/modules/chat/dtos/send.dto'
import { ChatService } from '@/modules/chat/chat.service'
import { User } from '@/common/decorator/user.decorator'
import { IUser } from '@/app'
import {
  GetConversationListQuery,
  GetConversationQuery,
} from '@/modules/chat/dtos/conversation.dto'

@Controller('chat')
export class ChatController {
  @Inject()
  private readonly service: ChatService

  @Get('conversation/list')
  getConversations(@Query() query: GetConversationListQuery, @User() user: IUser) {
    return this.service.getConversationList(query, user)
  }

  @Get('conversation')
  getConversation(@Query() query: GetConversationQuery, @User() user: IUser) {
    if (query.userId === user.studentId) {
      throw new ConflictException('不能与自己建立对话')
    }

    return this.service.getConversation(query, user)
  }

  @Post('send')
  send(@Body() dto: ChatSendDto, @User() user: IUser) {
    return this.service.send(dto, user)
  }
}
