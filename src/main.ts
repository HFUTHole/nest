import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AppConfig } from '@/app.config'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { useContainer } from 'class-validator'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { Repository } from 'typeorm'

async function initPostCategories(app: INestApplication) {
  const categoryRepo = app.get<Repository<PostCategoryEntity>>(getRepositoryToken(PostCategoryEntity))
  const categories = await categoryRepo.find({

  })
  if (categories.length) {
    return
  }

  const savedCategories  = categoryRepo.create([
    {
      name: '1',
      description: '1',
      bgUrl: '1',
    }
  ])

  await categoryRepo.save(savedCategories)
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

  await initPostCategories(app)

  await app.listen(config.server.port)
}

bootstrap()
