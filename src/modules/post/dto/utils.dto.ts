import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { InjectRepository } from '@nestjs/typeorm'
import { Post } from '@/entity/post/post.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import {
  BadRequestException,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common'
import { Comment } from '@/entity/post/comment.entity'
import { Vote } from '@/entity/post/vote.entity'
import { AppConfig } from '@/app.config'
import axios from 'axios'
import { InjectLogger } from '@/utils/decorator'
import { Reply } from '@/entity/post/reply.entity'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { GetPostDetailQuery, GetPostListQuery } from '@/modules/post/dto/post.dto'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPostExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

  async validate(id: number) {
    const post = await this.postRepo.findOneBy({ id })

    if (!post) {
      throw new NotFoundException('树洞不存在哦')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCommentExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  async validate(id: string) {
    const post = await this.commentRepo.findOne({
      where: {
        id,
      },
    })

    if (!post) {
      throw new NotFoundException('评论不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsVoteExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  async validate(id: string) {
    const post = await this.voteRepo.findOne({
      where: {
        id,
      },
    })

    if (!post) {
      throw new NotFoundException('投票不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsValidPostImgsConstraint {
  @InjectLogger()
  private readonly logger: LoggerService

  constructor(private readonly config: AppConfig) {}

  async validate(imgs: string[] | string) {
    if (!Array.isArray(imgs)) {
      await this.validateImgs([imgs])
      return true
    }

    if (!imgs.length) {
      return true
    }

    await this.validateImgs(imgs)

    return true
  }

  async validateImgs(imgs: string[]) {
    try {
      await axios.post(`${this.config.image.url}/validate`, {
        imgs,
      })
    } catch (err) {
      this.logger.error(err.stack.toString())
      throw new BadRequestException('图片无效')
    }
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsReplyExistConstraint {
  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  async validate(id: string) {
    const reply = await this.replyRepo.findOne({ where: { id } })

    if (!reply) {
      throw new NotFoundException('回复不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsVoteItemExistConstraint {
  @InjectRepository(VoteItem)
  private readonly voteItemRepo: Repository<VoteItem>

  async validate(id: string) {
    const reply = await this.voteItemRepo.findOne({ where: { id } })

    if (!reply) {
      throw new NotFoundException('投票不存在')
    }

    return true
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCorrectSubCategoryExistConstraint {
  @InjectRepository(PostCategoryEntity)
  private readonly postCategoryRepo: Repository<PostCategoryEntity>

  async validate(name: string, validationArguments: ValidationArguments) {
    const categoryName = (validationArguments.object as GetPostListQuery)[
      'classification'
    ]

    const category = await this.postCategoryRepo.findOne({

      where: {
        name: categoryName,
      },
    })



    return true
  }
}

export const IsVoteExist = createClassValidator(IsVoteExistConstraint)

export const IsVoteItemExist = createClassValidator(IsVoteItemExistConstraint)

export const IsPostExist = createClassValidator(IsPostExistConstraint)

export const IsCommentExist = createClassValidator(IsCommentExistConstraint)

export const IsReplyExist = createClassValidator(IsReplyExistConstraint)

export const IsValidPostImgs = createClassValidator(IsValidPostImgsConstraint)

export const IsCorrectSubCategory = createClassValidator(
  IsCorrectSubCategoryExistConstraint,
)
