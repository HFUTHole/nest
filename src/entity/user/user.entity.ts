import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm'
import { AutoIncIdEntity } from '@/common/entity/common.entity'
import { Post } from '@/entity/post/post.entity'
import { Comment } from '@/entity/post/comment.entity'
import { Reply } from '@/entity/post/reply.entity'
import { Role } from '@/modules/role/role.constant'
import { Vote } from '@/entity/post/vote.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { Report } from '@/entity/report/report.entity'
import { ConversationEntity } from '@/entity/chat/conversation.entity'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { Tags } from '@/entity/post/tags.entity'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'

export enum Gender {
  male = '男',
  female = '女',
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
    default: Role.User,
  })
  role: Role

  @Column({
    comment: '头像',
  })
  avatar?: string

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts: Post[]

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[]

  @OneToMany(() => Reply, (reply) => reply.user)
  replies: Reply[]

  // 被回复的评论
  @OneToMany(() => Reply, (reply) => reply.replyUser)
  repliedReply: Reply[]

  @ManyToMany(() => Post, (post) => post.favoriteUsers, { cascade: true })
  @JoinTable()
  favoritePost: Post[]

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

  @OneToOne(() => UserLevelEntity, (level) => level.user, { cascade: true })
  @JoinColumn()
  level: UserLevelEntity

  @OneToMany(() => Tags, (tag) => tag.collectedUsers, { cascade: true })
  collectedTags: Tags[]

  @ManyToMany(() => User, (user) => user.following)
  followers: User[]

  @ManyToMany(() => User, (user) => user.followers, { cascade: true })
  @JoinTable()
  following: User[]

  @OneToMany(() => UsedGoodsEntity, (goods) => goods.creator)
  usedGoods: UsedGoodsEntity

  @ManyToMany(() => UsedGoodsEntity, (goods) => goods.collector, { cascade: true })
  @JoinTable()
  collectedUsedGoods: UsedGoodsEntity[]

  readonly followingCounts?: number
}
