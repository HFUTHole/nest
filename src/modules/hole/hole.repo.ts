import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { createResponse } from '@/utils/create'
import { IProcessLikeOptions, ILikeableEntity } from '@/modules/hole/hole.types'
import { GetHoleDetailQuery } from '@/modules/hole/dto/hole.dto'
import { Vote } from '@/entity/hole/vote.entity'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { IUser } from '@/app'

// TODO 解决any类型
@Injectable()
export class HoleRepoService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  @InjectRepository(VoteItem)
  private readonly voteItemRepo: Repository<VoteItem>

  async processLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
    entity,
  }: IProcessLikeOptions<T>) {
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
}
