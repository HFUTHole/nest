import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { FindOptionsWhere, Repository } from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CreateHoleDto } from '@/modules/hole/dto/create'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate'
import { PaginateQuery } from '@/common/dtos/paginate.dto'

@Injectable()
export class HoleService {
  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async paginate<T>(options: IPaginationOptions<T>, searchableOptions?: FindOptionsWhere<T>) {
    return paginate(this.holeRepo, options)
  }

  async getList(query: PaginateQuery) {
    return this.paginate<Hole>({
      ...query,
    })
  }

  async create(dto: CreateHoleDto, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const hole = this.holeRepo.create({
      user,
      ...dto,
    })

    await this.holeRepo.save(hole)

    return createResponse('创建树洞成功')
  }
}
