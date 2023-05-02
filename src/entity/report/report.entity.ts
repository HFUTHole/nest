import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { User } from '@/entity/user/user.entity'

export enum ReportType {
  hole = 'hole',
  comment = 'comment',
  reply = 'reply',
}

@Entity()
export class Report extends CommonEntity {
  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType

  @Column()
  reason: string

  @ManyToOne(() => Hole, (hole) => hole.reports, { cascade: true })
  hole: Hole

  @ManyToOne(() => Comment, (comment) => comment.reports, { cascade: true })
  comment: Comment

  @ManyToOne(() => Reply, (reply) => reply.reports, { cascade: true })
  reply: Reply

  @ManyToMany(() => User, (user) => user.reports, { cascade: true })
  @JoinTable()
  user: User[]
}
