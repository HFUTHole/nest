import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { NotifyStatus } from '@/common/enums/notify/notify.enum'
import { User } from '@/entity/user/user.entity'

@Entity({ name: 'notify_system' })
export class NotifySystemEntity extends CommonEntity {
  @Column({
    comment: '标题',
  })
  title: string

  @Column({
    comment: '内容',
  })
  body: string

  @Column({
    type: 'boolean',
    comment: '是否已读',
    default: false,
  })
  isRead: boolean

  @ManyToOne(() => User)
  user: User
}
