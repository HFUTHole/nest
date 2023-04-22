import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOneOptions, Repository } from 'typeorm'
import { createResponse } from '@/utils/create'
import { IProcessLikeOptions, ILikeableEntity } from '@/modules/hole/hole.types'

@Injectable()
export class HoleRepoService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async processLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
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

    return createResponse('点赞成功')
  }

  async processDeleteLike<T extends ILikeableEntity>({
    dto,
    reqUser,
    repo,
    propertyPath,
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

    return createResponse('取消点赞成功')
  }
}
