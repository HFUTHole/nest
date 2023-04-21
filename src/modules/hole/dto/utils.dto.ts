import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import {
  BadRequestException,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common'
import { Comment } from '@/entity/hole/comment.entity'
import { Vote } from '@/entity/hole/vote.entity'
import { AppConfig } from '@/app.config'
import axios from 'axios'
import { InjectLogger } from '@/utils/decorator'
import { Reply } from '@/entity/hole/reply.entity'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsHoleExistConstraint implements ValidatorConstraintInterface {
  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  async validate(id: number) {
    const hole = await this.holeRepo.findOneBy({ id })

    if (!hole) {
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
    const hole = await this.commentRepo.findOne({
      where: {
        id,
      },
    })

    if (!hole) {
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
    const hole = await this.voteRepo.findOne({
      where: {
        id,
      },
    })

    if (!hole) {
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

  async validate(imgs: string[]) {
    if (!imgs.length) {
      return true
    }

    try {
      await axios.post(`${this.config.image.url}/validate`, {
        imgs,
      })
    } catch (err) {
      this.logger.error(err.stack.toString())
      throw new BadRequestException('图片无效')
    }

    return true
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

export const IsVoteExist = createClassValidator(IsVoteExistConstraint)

export const IsHoleExist = createClassValidator(IsHoleExistConstraint)

export const IsCommentExist = createClassValidator(IsCommentExistConstraint)

export const IsReplyExist = createClassValidator(IsReplyExistConstraint)

export const IsValidPostImgs = createClassValidator(IsValidPostImgsConstraint)
