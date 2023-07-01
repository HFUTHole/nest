import { Column, Entity, Index, ManyToMany, OneToMany, JoinTable } from 'typeorm'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'
import { Comment } from '@/entity/hole/comment.entity'
import { Reply } from '@/entity/hole/reply.entity'
import { Role } from '@/modules/role/role.constant'
import { Vote } from '@/entity/hole/vote.entity'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { Report } from '@/entity/report/report.entity'
import { ConversationEntity } from '@/entity/chat/conversation.entity'

export enum Gender {
  Male = '男',
  Female = '女',
}

// TODO 将用户与树洞表分离
@Entity()
export class User extends AutoIncIdEntity {
  @Index()
  @Column({ comment: '学号', select: false })
  studentId: number

  @Index()
  @Column({ comment: '用户名' })
  username: string

  @Column({ comment: '密码', select: false })
  password: string

  @Column({ comment: '信息门户密码', select: false })
  hfutPassword: string

  @Column({
    comment: '性别',
    type: 'enum',
    enum: Gender,
    select: false,
  })
  gender: Gender

  @Column({
    comment: '角色权限',
    type: 'enum',
    enum: Role,
    select: false,
    default: Role.User,
  })
  role: Role

  @Column({
    comment: '头像',
  })
  avatar?: string

  @OneToMany(() => Hole, (hole) => hole.user, { cascade: true })
  holes: Hole[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[]

  // 被回复的评论
  @OneToMany(() => Reply, (reply) => reply.replyUser)
  repliedReply: Reply[]

  @ManyToMany(() => Hole, (hole) => hole.favoriteUsers, { cascade: true })
  @JoinTable()
  favoriteHole: Hole[]

  @ManyToMany(() => Comment, (comment) => comment.favoriteUsers, { cascade: true })
  @JoinTable()
  favoriteComment: Comment[]

  @ManyToMany(() => Reply, (reply) => reply.favoriteUsers, { cascade: true })
  @JoinTable()
  favoriteReply: Reply[]

  @ManyToMany(() => Vote, (vote) => vote.user, { cascade: true })
  @JoinTable()
  votes: Vote[]

  @ManyToMany(() => VoteItem, (voteItem) => voteItem.user, { cascade: true })
  @JoinTable()
  voteItems: VoteItem[]

  @ManyToMany(() => Report, (report) => report.user)
  reports: Report[]

  @ManyToMany(() => ConversationEntity, (conversation) => conversation.user)
  conversations: ConversationEntity[]
}
