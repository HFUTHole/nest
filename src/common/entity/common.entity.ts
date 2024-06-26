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
@Index(['id'])
export class CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

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
    select: true,
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

@Entity()
@Index(['id'])
export class AutoIncIdEntity {
  @PrimaryGeneratedColumn()
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
    select: true,
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

@Entity()
export class WithOutPrimaryEntity {
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
