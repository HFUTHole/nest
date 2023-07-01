import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { ConversationEntity } from '@/entity/chat/conversation.entity'
import { User } from '@/entity/user/user.entity'

@Entity({ name: 'message' })
export class MessageEntity extends CommonEntity {
  @OneToMany(() => ConversationEntity, (conversation) => conversation.messages)
  conversation: ConversationEntity

  @ManyToOne(() => User)
  sender: User

  @Column({ comment: '消息内容' })
  body: string
}
