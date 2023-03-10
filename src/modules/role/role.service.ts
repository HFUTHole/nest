import { Injectable } from '@nestjs/common'
import { Role } from '@/modules/role/role.constant'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'

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
}
