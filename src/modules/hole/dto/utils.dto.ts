import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import { Repository } from 'typeorm'
import { createClassValidator } from '@/utils/create'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Comment } from '@/entity/hole/comment.entity'
import { Vote } from '@/entity/hole/vote.entity'

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

export const IsVoteExist = createClassValidator(IsVoteExistConstraint)

export const IsHoleExist = createClassValidator(IsHoleExistConstraint)

export const IsCommentExist = createClassValidator(IsCommentExistConstraint)
