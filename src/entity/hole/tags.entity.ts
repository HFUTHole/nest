import { Column, Entity, ManyToMany } from 'typeorm'
import { CommonEntity } from '@/common/entity/common.entity'
import { Hole } from '@/entity/hole/hole.entity'

@Entity()
export class Tags extends CommonEntity {
  @Column()
  body: string

  @ManyToMany(() => Hole, (hole) => hole.tags)
  holes: Hole[]
}
