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
import { UserService } from '@/modules/user/user.service'
import { createResponse } from '@/utils/create'
import { JwtService } from '@nestjs/jwt'
import { encryptPassword, verifyPassword } from '@/modules/auth/auth.utils'
import { AppConfig } from '@/app.config'
import { getAvatarUrl } from '@/utils/user'

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @Inject()
  private readonly userService: UserService

  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { studentId: dto.studentId },
      select: { password: true },
    })

    const isVerified = await verifyPassword(user.password, dto.password)

    if (!isVerified) {
      throw new BadRequestException('账号或密码错误')
    }

    const token = this.signToken(dto.studentId)

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

    const isHFUTPasswordVerified = await this.verifyHFUTPassword(dto.hfutPassword)

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
    })

    user.avatar = getAvatarUrl(this.appConfig, user)

    let token
    try {
      token = this.signToken(dto.studentId)
    } catch (err) {
      throw err
    }

    try {
      await this.userRepo.save(user)
    } catch (err) {
      throw err
    }

    return createResponse('注册成功', { token })
  }

  async forget(dto: ForgetPasswordDto) {
    const user = await this.userRepo.findOneBy({
      studentId: dto.studentId,
    })

    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    const isHfutPasswordCorrect = await this.verifyHFUTPassword(dto.hfutPassword)

    if (!isHfutPasswordCorrect) {
      throw new BadRequestException('信息门户密码错误')
    }

    user.hfutPassword = await encryptPassword(dto.hfutPassword)
    user.password = await encryptPassword(dto.password)

    await this.userRepo.save(user)

    const token = this.signToken(dto.studentId)

    return createResponse('修改密码成功', { token })
  }

  async verifyHFUTPassword(password: string) {
    return {
      gender: Gender.Male,
    }
  }

  signToken(studentId: number) {
    return this.jwtService.sign({ studentId })
  }
}
