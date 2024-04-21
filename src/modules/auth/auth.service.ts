import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ForgetPasswordDto, LoginDto, RegisterDto } from '@/modules/auth/dto/auth.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Gender, User } from '@/entity/user/user.entity'
import { Repository } from 'typeorm'
import { UserService } from '@/modules/user/service/user.service'
import { createResponse } from '@/utils/create'
import { JwtService } from '@nestjs/jwt'
import { encryptPassword, verifyPassword } from '@/modules/auth/auth.utils'
import { AppConfig } from '@/app.config'
import { getAvatarUrl } from '@/utils/user'
import axios from 'axios'
import { UserLevelEntity } from '@/entity/user/level.entity'
import { getNextRequiredExperience } from '@/constants/level'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(UserLevelEntity)
  private readonly userLevelRepo: Repository<UserLevelEntity>

  @Inject()
  private readonly userService: UserService

  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { studentId: dto.studentId },
      select: { password: true, username: true, studentId: true, id: true },
    })

    const isVerified = await verifyPassword(user.password, dto.password)

    if (!isVerified) {
      throw new BadRequestException('账号或密码错误')
    }

    const token = this.signToken(user)

    return createResponse('登录成功', { token })
  }

  async register(dto: RegisterDto) {
    const isStudentIdExist = await this.userRepo.findOneBy({
      studentId: dto.studentId,
    })

    if (isStudentIdExist) {
      throw new BadRequestException('该用户已注册')
    }

    const isUsernameExist = await this.userRepo.findOneBy({
      username: dto.username,
    })

    if (isUsernameExist) {
      throw new BadRequestException('嗨嗨嗨，换个名字吧，这个已经被注册了')
    }

    const isHFUTPasswordVerified = await this.verifyHFUTPassword(
      dto.studentId,
      dto.hfutPassword,
    )

    if (!isHFUTPasswordVerified) {
      throw new BadRequestException('信息门户密码错误')
    }

    const password = await encryptPassword(dto.password)
    const hfutPassword = await encryptPassword(dto.hfutPassword)

    const user = this.userRepo.create({
      ...dto,
      hfutPassword,
      password,
      gender: isHFUTPasswordVerified.gender,
      level: this.userLevelRepo.create({
        experience: 0,
        level: 1,
        nextLevelRequiredExperience: getNextRequiredExperience(1).nextRequiredExperience,
      }),
    })

    user.avatar = getAvatarUrl(this.appConfig, user)

    const savedUser = await this.userRepo.save(user)
    const token = this.signToken(savedUser)

    return createResponse('注册成功', { token })
  }

  async forget(dto: ForgetPasswordDto) {
    const user = await this.userRepo.findOneBy({
      studentId: dto.studentId,
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const isHfutPasswordCorrect = await this.verifyHFUTPassword(
      dto.studentId,
      dto.hfutPassword,
    )

    if (!isHfutPasswordCorrect) {
      throw new BadRequestException('信息门户密码错误')
    }

    user.hfutPassword = await encryptPassword(dto.hfutPassword)
    user.password = await encryptPassword(dto.password)

    const savedUser = await this.userRepo.save(user)

    const token = this.signToken(savedUser)

    return createResponse('修改密码成功', { token })
  }

  async verifyHFUTPassword(studentId: number, password: string) {
    // const url = `${this.appConfig.hfut.url}/login/verify`
    //
    // try {
    //   await axios({
    //     method: 'GET',
    //     url,
    //     params: {
    //       username: studentId,
    //       password,
    //     },
    //   })
    // } catch (error) {
    //   if (studentId.toString().startsWith('2023')) {
    //     throw new BadRequestException('新生还没有开放信息门户哦，等导员通知吧！')
    //   }
    //   throw new BadRequestException('信息门户密码错误')
    // }

    return {
      gender: Gender.male,
    }
  }

  signToken(user: User) {
    return this.jwtService.sign({ id: user.id, studentId: user.studentId })
  }
}
