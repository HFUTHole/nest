import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AppConfig } from '@/app.config'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { In, Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Tags } from '@/entity/post/tags.entity'
import { Category } from '@/constants/category'

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

  await app.listen(config.server.port)
}

bootstrap()
