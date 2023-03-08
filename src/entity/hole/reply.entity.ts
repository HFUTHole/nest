import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CommonEntity } from '@/common/entity/common.entity'

@Entity({ name: 'reply' })
export class ReplyEntity extends CommonEntity {
  @Column({ comment: '留言内容' })
  body: string

  @ManyToOne(() => User, (user) => user.comments, { cascade: true })
  user: User
}
