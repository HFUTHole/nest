import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SnowflakeIdv1 } from 'simple-flakeid'
import { Timestamp } from '@/common/decorator/timestamp.decorator'

export const snowflake = new SnowflakeIdv1({
  workerId: 1,
})

@Entity()
export class CommonEntity {
  @Index()
  @PrimaryColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: string | number = snowflake.NextBigId().toString()

  @CreateDateColumn({
    type: 'timestamp',
    comment: '创建时间',
    name: 'create_at',
  })
  @Timestamp()
  createAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '更新时间',
    name: 'update_at',
    select: false,
  })
  @Timestamp()
  updateAt: Date

  @DeleteDateColumn({
    type: 'timestamp',
    comment: '删除时间',
    name: 'delete_at',
    select: false,
  })
  @Timestamp()
  deleteAt: Date
}

@Entity()
export class AutoIncIdEntity {
  @PrimaryGeneratedColumn()
  @Index()
  id: number

  @CreateDateColumn({
    type: 'timestamp',
    comment: '创建时间',
    name: 'create_at',
  })
  @Timestamp()
  createAt: Date

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '更新时间',
    name: 'update_at',
    select: false,
  })
  @Timestamp()
  updateAt: Date

  @DeleteDateColumn({
    type: 'timestamp',
    comment: '删除时间',
    name: 'delete_at',
    select: false,
  })
  @Timestamp()
  deleteAt: Date

  @Column('boolean', {
    default: false,
    name: 'is_hidden',
    comment: '是否隐藏',
    select: false,
  })
  isHidden: boolean
}
