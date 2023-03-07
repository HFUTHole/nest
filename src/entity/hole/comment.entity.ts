import { CommonEntity } from '@/common/entity/common.entity'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Hole } from '@/entity/hole/hole.entity'

@Entity()
export class Comment extends CommonEntity {
  @Column({ comment: '留言内容' })
  body: string

  @ManyToOne(() => Hole, (hole) => hole.comments, { cascade: true, eager: true })
  hole: Hole
}
