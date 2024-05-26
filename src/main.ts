import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AppConfig } from '@/app.config'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { In, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Tags } from '@/entity/post/tags.entity'
import { Category } from '@/constants/category'
import { User } from '@/entity/user/user.entity'
import { Role } from '@/modules/role/role.constant'
import { AuthService } from '@/modules/auth/auth.service'

async function initTags(app: INestApplication) {
  const tagRepo = app.get<Repository<Tags>>(getRepositoryToken(Tags))
  const tags = await tagRepo.find({
    where: {
      body: In(Category.map((item) => item.name)),
    },
  })

  if (!tags.length) {
    const data = Category.map((item) => ({
      ...tagRepo.create({
        body: item.name,
        desc: item.description,
      }),
    }))

    await tagRepo.save(data)
  }
}

async function initAdmin(app: INestApplication) {
  const config: AppConfig = app.get<AppConfig>(AppConfig)

  const authService: AuthService = app.get(AuthService)

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User))

  if (!config.user.admin) {
    return
  }

  config.user.admin.map(async (admin) => {
    const user = await userRepo.findOne({
      where: {
        studentId: admin.studentId,
      },
    })

    if (user && user.role !== Role.Admin) {
      user.role = Role.Admin
      await userRepo.save(user)

      console.log(admin.studentId + 'has update to admin')

      return
    } else if (!user) {
      await authService.register({
        studentId: admin.studentId,
        password: admin.password,
        username: admin.studentId.toString(),
        hfutPassword: admin.hfutPassword,
      })
      console.log(admin.studentId + 'has update to admin')

      return
    }
  })
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config: AppConfig = app.get<AppConfig>(AppConfig)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.useGlobalPipes(new ValidationPipe(config.validations))

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })

  await initTags(app)
  await initAdmin(app)

  await app.listen(config.server.port)
}

bootstrap()
