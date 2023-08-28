import { ConflictException, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { createResponse } from '@/utils/create'
import { IProcessLikeOptions, ILikeableEntity } from '@/modules/hole/hole.types'
import {
  GetHoleDetailQuery,
  GetHoleListQuery,
  HoleListMode,
} from '@/modules/hole/dto/hole.dto'
import { Vote } from '@/entity/hole/vote.entity'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { IUser } from '@/app'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
import { initHoleDateSelect, resolvePaginationHoleData } from '@/modules/hole/hole.utils'
import { Hole } from '@/entity/hole/hole.entity'
import { AppConfig } from '@/app.config'
import { NotifySystemEntity } from '@/entity/notify/notify-system.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifyService } from '@/modules/notify/notify.service'
import { CreateInteractionNotifyInterface } from '@/modules/notify/interface/params.interface'
import { NotifyEventType } from '@/common/enums/notify/notify.enum'

// TODO 解决any类型
@Injectable()
export class HoleRepoService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  @InjectRepository(VoteItem)
  private readonly voteItemRepo: Repository<VoteItem>

  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(NotifySystemEntity)
  private readonly notifySystemRepo: Repository<NotifySystemEntity>

  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @Inject()
  private readonly notifyService: NotifyService

  constructor(private readonly appConfig: AppConfig) {}

  async processLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
    entity,
    type,
    notifyProps,
  }: IProcessLikeOptions<T> & {
    type: string
    notifyProps?: Pick<
      CreateInteractionNotifyInterface,
      'holeId' | 'commentId' | 'replyId'
    >
  }) {
    const isLiked = await repo.findOne({
      relations: {
        favoriteUsers: true,
      },
      where: {
        id: dto.id,
        favoriteUsers: {
          studentId: reqUser.studentId,
        },
      },
    } as FindOneOptions<T>)

    if (isLiked) {
      throw new ConflictException('你已经点赞过了')
    }

    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
      relations: { favoriteComment: true },
    })

    const target = await repo.findOne({
      relations: {
        user: true,
      },
      select: {
        user: {
          username: true,
          studentId: true,
        },
      },
      where: {
        id: dto.id,
      },
    } as FindOneOptions<T>)

    await this.userRepo
      .createQueryBuilder()
      .relation(User, propertyPath as string)
      .of(user)
      .add(target)

    await repo
      .createQueryBuilder()
      .update(entity as any)
      .set({ favoriteCounts: () => 'favoriteCounts + 1' } as any)
      .where('id = :id', { id: dto.id })
      .execute()

    if (reqUser.studentId !== target.user.studentId) {
      await this.notifyService.createInteractionNotify({
        type: NotifyEventType.like,
        reqUser,
        body: `${user.username} 赞了你的${type}`,
        recipientId: target.user.studentId,
        ...notifyProps,
      })
    }

    return createResponse('点赞成功')
  }

  async processDeleteLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
    entity,
  }: IProcessLikeOptions<T>) {
    const target = await repo.findOne({
      relations: {
        favoriteUsers: true,
      },
      where: {
        id: dto.id,
        favoriteUsers: {
          studentId: reqUser.studentId,
        },
      },
    } as FindOneOptions<T>)

    if (!target) {
      throw new ConflictException('你还没有点赞哦')
    }

    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
      relations: { favoriteComment: true },
    })

    await this.userRepo
      .createQueryBuilder()
      .relation(User, propertyPath)
      .of(user)
      .remove(target)

    await repo
      .createQueryBuilder()
      .update(entity as any)
      .set({ favoriteCounts: () => 'favoriteCounts - 1' } as any)
      .where('id = :id', { id: dto.id })
      .execute()

    return createResponse('取消点赞成功')
  }

  async findVote(dto: GetHoleDetailQuery, reqUser: IUser) {
    const vote = await this.voteRepo
      .createQueryBuilder('vote')
      .setFindOptions({
        where: {
          hole: {
            id: dto.id,
          },
        },
      })
      .leftJoinAndSelect('vote.items', 'voteItems')
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .getOne()

    if (!vote) {
      return null
    }

    const voteItems = await this.voteItemRepo
      .createQueryBuilder('item')
      .setFindOptions({
        where: {
          vote: {
            id: vote.id,
          },
        },
      })
      .loadRelationCountAndMap('item.isVoted', 'item.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .getMany()

    const totalCount = voteItems.map((item) => item.count).reduce((a, b) => a + b, 0)
    vote.totalCount = totalCount
    vote.items = voteItems
    vote.isExpired = new Date(vote.endTime) < new Date()

    return vote
  }

  async getList(query: GetHoleListQuery, reqUser: IUser) {
    const queryBuilder = initHoleDateSelect(this.holeRepo)
      .loadRelationCountAndMap('voteItems.isVoted', 'voteItems.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .loadRelationCountAndMap('vote.isVoted', 'vote.user', 'isVoted', (qb) =>
        qb.andWhere('isVoted.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )

    // TODO remove
    if (query.category) {
      queryBuilder.where('category.category = :category', {
        category: query.category,
      })
    }

    if (query.classification) {
      queryBuilder.andWhere('classification.name = :name', {
        name: query.classification,
      })

      if (query.subClassification) {
        queryBuilder.andWhere('subClassification.name = :subName', {
          subName: query.subClassification,
        })
      }
    }

    if (query.mode === HoleListMode.hot) {
      queryBuilder
        .addSelect(`LOG10(RAND(hole.id)) * RAND() * 100`, 'score')
        .orderBy('score', 'DESC')
    } else if (query.mode === HoleListMode.latest) {
      queryBuilder.orderBy('hole.createAt', 'DESC')
    }

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

    // TODO 用sql解决，还是得多学学sql啊
    resolvePaginationHoleData(data, this.appConfig)

    return data
  }
}
