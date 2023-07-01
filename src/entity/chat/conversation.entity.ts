import { Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { MessageEntity } from '@/entity/chat/message.entity'
import { User } from '@/entity/user/user.entity'

@Entity({ name: 'conversation' })
export class ConversationEntity extends CommonEntity {
  @ManyToMany(() => User, (user) => user.conversations, { cascade: true })
  @JoinTable()
  user: User[]

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[]
}
