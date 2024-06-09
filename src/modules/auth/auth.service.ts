import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ForgetPasswordDto, LoginDto, RegisterDto, SMSRegisterDto, SMSRequestDto } from '@/modules/auth/dto/auth.dto'
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
import { InjectRedis } from '@liaoliaots/nestjs-redis'
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
      where: [
        { studentId: dto.studentId },
        { phoneNumber: dto.phoneNumber }
      ],
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
    let verifyCode = parseInt(await this.redis.get(key))
    console.log(verifyCode);
    
    if (verifyCode === null || isNaN(verifyCode)) {
      throw new BadRequestException('请发送验证码!')
    }
    if (verifyCode !== dto.verifyCode) {
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


  async sendSMS(dto: SMSRequestDto) {
    const key = `register_sms_code:${dto.phoneNumber}`
    let verifyCode = await this.redis.get(key)
    
    if (verifyCode !== null) {
      throw new BadRequestException("60s内只能发送一次")
    }

    verifyCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')

    const formData = new FormData();
    formData.append('app_id', '9RZ%-7I*k3x7fk#cZ1gvy=%#2T5XfDSSX');
    formData.append('phone_number', dto.phoneNumber);
    formData.append('verify_code', verifyCode);
    formData.append('expire_time', '5');
      
    try {
      // 设置 Redis 中的验证码，并设置过期时间为 60 秒
      await this.redis.set(key, verifyCode, 'EX', 60);
      //todo 常量加入配置
      const response = await axios({
        method: 'POST',
        url: 'http://api.xfs.lnyynet.com/verify-sms/sendVerifyCode',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data', // 设置正确的 Content-Type
        }
      });
      if (response.data.code != 200) {
        await this.redis.del(key);
        console.error('Axios request failed:', response.data)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // 处理 Axios 错误
        await this.redis.del(key);
        console.error('Axios request failed:', error.message);
        throw new BadRequestException('发送验证码失败');
      } else {
        // 处理其他类型的错误
        await this.redis.del(key);
        console.error('An error occurred:', error);
        throw new BadRequestException('发送验证码时发生未知错误');
      }
    }
    return createResponse('发送成功')
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

