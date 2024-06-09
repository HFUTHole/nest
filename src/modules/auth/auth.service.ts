import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ForgetPasswordDto, LoginDto, RegisterDto, SMSRegisterDto } from '@/modules/auth/dto/auth.dto'
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
import Redis from 'ioredis'
import { Role } from '../role/role.constant'

@Injectable()
export class AuthService {
  
  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(UserLevelEntity)
  private readonly userLevelRepo: Repository<UserLevelEntity>

  @Inject()
  private readonly userService: UserService

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
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

    const user = this.userRepo.create({
      ...dto,
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


  async registerBySMS(dto: SMSRegisterDto) {
    const isPhoneRegisterd = await this.userRepo.findOneBy({
      phoneNumber: dto.phoneNumber,
    })

    if (isPhoneRegisterd) {
      throw new BadRequestException('该手机号已注册')
    }

    const isUsernameExist = await this.userRepo.findOneBy({
      username: dto.username,
    })

    if (isUsernameExist) {
      throw new BadRequestException('嗨嗨嗨，换个名字吧，这个已经被注册了')
    }

    const key = `register_sms_code:${dto.phoneNumber}`
    var verifyCode = parseInt(await this.redis.get(key))
    if (verifyCode != dto.verifyCode) {
      throw new BadRequestException('验证码错误!')
    }

    const password = await encryptPassword(dto.password)

    const user = this.userRepo.create({
      ...dto,
      password,
      gender: Gender.male,
      role: Role.Unverifed,
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


  async sendSMS(dto: SMSRegisterDto) {
    const key = `register_sms_code:${dto.phoneNumber}`
    var verifyCode = parseInt(await this.redis.get(key))
    
    if (verifyCode != null) {
      throw new BadRequestException("60s内只能发送一次")
    }

    verifyCode = parseInt(Math.floor(Math.random() * 1000000).toString().padStart(6, '0'))

    try {
      // 设置 Redis 中的验证码，并设置过期时间为 60 秒
      await this.redis.set(key, verifyCode, 'EX', 60);
      //todo 常量加入配置
      await axios({
        method: 'POST',
        url : 'https://api.xfs.lnyynet.com/verify-sms/sendVerifyCode',
        params: {
          app_id: '9RZ%-7I*k3x7fk#cZ1gvy=%#2T5XfDSSX',
          phone_number: dto.phoneNumber,
          verify_code: verifyCode,
          expire_time: 60
        }
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 Axios 错误
        await this.redis.delete(key);
        console.error('Axios request failed:', error.message);
        throw new BadRequestException('发送验证码失败');
      } else {
        // 处理其他类型的错误
        await this.redis.delete(key);
        console.error('An error occurred:', error);
        throw new BadRequestException('发送验证码时发生未知错误');
      }
    }
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

    user.password = await encryptPassword(dto.password)

    const savedUser = await this.userRepo.save(user)

    const token = this.signToken(savedUser)

    return createResponse('修改密码成功', { token })
  }

  async verifyHFUTPassword(studentId: number, password: string) {
    const url = `${this.appConfig.hfut.url}/login/verify`

    try {
      await axios({
        method: 'GET',
        url,
        params: {
          username: studentId,
          password,
        },
      })
    } catch (error) {
      // if (studentId.toString().startsWith('2023')) {
      //   throw new BadRequestException('新生还没有开放信息门户哦，等导员通知吧！')
      // }
      throw new BadRequestException('信息门户密码错误')
    }

    return {
      gender: Gender.male,
    }
  }

  signToken(user: User) {
    return this.jwtService.sign({ id: user.id, studentId: user.studentId })
  }
}
function InjectRedis(): (target: typeof AuthService, propertyKey: undefined, parameterIndex: 0) => void {
  throw new Error('Function not implemented.')
}

