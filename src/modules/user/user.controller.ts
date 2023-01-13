import { Body, Controller, Get, Inject, Post } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { UserService } from '@/modules/user/user.service'
import { UserCreateDto } from '@/modules/user/dtos/user_create.dto'

@Controller('user')
export class UserController {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>

  @Inject()
  private readonly userService: UserService

  @Get('info')
  async getInfo() {
    const user = await this.userRepository.find({
      where: {
        studentId: 2021217985,
      },
    })

    return user
  }

  @Get('findAll')
  findAll() {
    return this.userService.findAll()
  }

  @Post('create')
  create(@Body() dto: UserCreateDto) {
    return this.userService.create(dto)
  }
}
