import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { FindOptionsWhere, Repository } from 'typeorm'
import { UserCreateDto } from '@/modules/user/dtos/user_create.dto'

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>
  findAll() {
    return this.userRepository.find()
  }

  async findOne(where: FindOptionsWhere<User>) {
    return this.userRepository.findOne({
      where,
    })
  }

  async create(dto: UserCreateDto) {}
}
