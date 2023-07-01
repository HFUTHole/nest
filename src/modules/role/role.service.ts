import { ConflictException, Injectable } from '@nestjs/common'
import { Role } from '@/modules/role/role.constant'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { BanDto, LiberateDto } from '@/modules/role/role.dto'
import { createResponse } from '@/utils/create'

@Injectable()
export class RoleService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  async isAdmin(id: number) {
    const user = await this.findUser(id)
    return user.role === Role.Admin
  }

  async isBanned(id: number) {
    const user = await this.findUser(id)
    return user.role === Role.Banned
  }

  async findUser(studentId: number) {
    return this.userRepo.findOneBy({ studentId })
  }

  async ban(dto: BanDto) {
    const user = await this.userRepo.findOneBy({
      studentId: dto.userId,
    })

    if (user.role === Role.Banned) {
      throw new ConflictException('该用户已被封禁')
    }

    user.role = Role.Banned

    await this.userRepo.save(user)

    return createResponse('用户封禁成功')
  }

  async liberate(dto: LiberateDto) {
    const user = await this.userRepo.findOneBy({
      studentId: dto.userId,
    })

    user.role = Role.User

    await this.userRepo.save(user)

    return createResponse('用户解封成功')
  }
}
