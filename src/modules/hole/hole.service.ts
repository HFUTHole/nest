import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import {
  EntityManager,
  FindManyOptions,
  FindOptionsOrder,
  Like,
  Repository,
} from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CreateHoleDto } from '@/modules/hole/dto/create.dto'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { paginate } from 'nestjs-typeorm-paginate'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetHoleCommentDto,
  LikeCommentDto,
} from '@/modules/hole/dto/comment.dto'
import { Comment } from '@/entity/hole/comment.entity'
import {
  DeleteHoleDto,
  GetHoleDetailQuery,
  GetHoleListQuery,
  HoleListMode,
} from '@/modules/hole/dto/hole.dto'
import { Reply } from '@/entity/hole/reply.entity'
import {
  DeleteLikeReplyDto,
  GetRepliesQuery,
  LikeReplyDto,
  ReplyReplyDto,
} from '@/modules/hole/dto/replies.dto'
import { Tags } from '@/entity/hole/tags.entity'
import { Vote, VoteType } from '@/entity/hole/vote.entity'
import { PostVoteDto } from '@/modules/hole/dto/vote.dto'
import { NotifyService } from '@/modules/notify/notify.service'
import { NotifyEvent } from '@/entity/notify/notify.entity'
import { AppConfig } from '@/app.config'
import {
  HoleDetailCommentMode,
  HoleDetailCommentOrderMode,
} from '@/modules/hole/hole.constant'
import { SearchQuery } from '@/modules/hole/dto/search.dto'
import { resolvePaginationHoleData } from '@/modules/hole/hole.utils'
import { HoleRepoService } from '@/modules/hole/hole.repo'
import { VoteItem } from '@/entity/hole/VoteItem.entity'

@Injectable()
export class HoleService {
  @InjectRepository(Hole)
  private readonly holeRepo: Repository<Hole>

  @InjectRepository(User)
  private readonly userRepo: Repository<User>

  @InjectRepository(Comment)
  private readonly commentRepo: Repository<Comment>

  @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>

  @InjectRepository(Tags)
  private readonly tagsRepo: Repository<Tags>

  @InjectRepository(Vote)
  private readonly voteRepo: Repository<Vote>

  @InjectRepository(VoteItem)
  private readonly voteItemRepo: Repository<VoteItem>

  @InjectEntityManager()
  private readonly manager: EntityManager

  @Inject()
  private readonly notifyService: NotifyService

  @Inject()
  private readonly holeRepoService: HoleRepoService

  constructor(private readonly appConfig: AppConfig) {}

  async getList(query: GetHoleListQuery) {
    let queryBuilder = this.holeRepo.createQueryBuilder('hole').setFindOptions({
      relations: {
        user: true,
        // votes: true,
        comments: { user: true },
      },
      order: {
        comments: {
          createAt: 'ASC',
        },
      },
    })

    if (query.mode === HoleListMode.random) {
      queryBuilder = queryBuilder
        .addSelect('LOG10(hole.favoriteCounts + 2) * RAND() * 5', 'score')
        .orderBy('score', 'DESC')
    } else if (query.mode === HoleListMode.timeline) {
      queryBuilder = queryBuilder.orderBy('hole.createAt', 'DESC')
    }

    const data = await paginate(queryBuilder, query)

    // TODO 用sql解决，还是得多学学sql啊
    resolvePaginationHoleData(data, this.appConfig)

    return data
  }

  async delete(body: DeleteHoleDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      where: { id: body.id },
      select: { user: { studentId: true } },
    })

    if (hole.user.studentId !== reqUser.studentId) {
      throw new ForbiddenException('这不是你的树洞哦')
    }

    await this.holeRepo.delete({ id: hole.id })

    return createResponse('删除成功')
  }

  async getTags() {
    return this.tagsRepo.find({
      relations: {
        holes: true,
      },
      where: { holes: { id: 5 } },
    })
  }

  async vote(dto: PostVoteDto, reqUser: IUser) {}

  async getDetail(query: GetHoleDetailQuery, reqUser: IUser) {
    const data = await this.holeRepo
      .createQueryBuilder('hole')
      .setFindOptions({
        relations: {
          user: true,
          vote: {
            items: true,
          },
        },
        where: {
          id: query.id,
        },
      })
      .loadRelationCountAndMap('hole.isLiked', 'hole.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .getOne()

    return createResponse('获取树洞详情成功', data as any)
  }

  async likeHole(dto: GetHoleDetailQuery, reqUser: IUser) {
    return this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.holeRepo,
      propertyPath: 'favoriteHole',
    })
  }

  async deleteLike(dto: GetHoleDetailQuery, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.holeRepo,
      propertyPath: 'favoriteHole',
    })
  }

  async create(dto: CreateHoleDto, reqUser: IUser) {
    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const tags = dto.tags.map((tag) =>
      this.tagsRepo.create({
        body: tag,
      }),
    )

    const hole = this.holeRepo.create({
      user,
      body: dto.body,
      imgs: dto.imgs,
      tags,
    })

    if (dto.vote) {
      const votes = dto.vote.items.map((item) =>
        this.voteItemRepo.create({
          option: item,
        }),
      )

      const vote = this.voteRepo.create({
        items: votes,
        endTime: dto.vote.endTime,
        type: dto.vote.isMultipleVote ? VoteType.multiple : VoteType.single,
        hole,
      })

      hole.vote = vote
    }

    await this.holeRepo.save(hole)

    return createResponse('创建树洞成功', { id: hole.id })
  }

  async createComment(dto: CreateCommentDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const comment = this.commentRepo.create({
      body: dto.body,
      hole,
      user,
    })

    await this.manager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.getRepository(Comment).save(comment)
      await this.notifyService.notify(
        NotifyEvent.comment,
        `有人评论了你的树洞#${hole.id}`,
        hole.user.studentId,
        hole.id,
        transactionalEntityManager,
      )
    })

    return createResponse('留言成功', { id: comment.id })
  }

  async getComment(dto: GetHoleCommentDto) {
    const hole = await this.holeRepo.findOne({
      relations: {
        user: true,
      },
      select: {
        user: {
          studentId: true,
        },
      },
      where: { id: dto.id },
    })

    const isFavoriteOrder = dto.order === HoleDetailCommentOrderMode.favorite
    const isAscOrder = dto.order === HoleDetailCommentOrderMode.time_asc

    const order: FindOptionsOrder<Comment> = {
      replies: {
        favoriteCounts: 'ASC',
      },
      ...(isFavoriteOrder
        ? { favoriteCount: 'ASC' }
        : isAscOrder
        ? { createAt: 'ASC' }
        : { createAt: 'DESC' }),
    }

    const commentQuery = this.commentRepo
      .createQueryBuilder('comment')
      .setFindOptions({
        relations: { user: true, replies: { user: true, replyUser: true } },
        order,
        where: {
          hole: { id: dto.id },
          ...(dto.mode === HoleDetailCommentMode.author && {
            user: { studentId: hole.user.studentId },
          }),
        },
      })
      .loadRelationCountAndMap('comment.repliesCount', 'comment.replies')

    const data = await paginate<Comment>(commentQuery, {
      limit: dto.limit,
      page: dto.page,
    })

    // TODO use queryBuilder to solve this problem
    ;(data as any).items = data.items.map((item) => {
      item.replies = item.replies.slice(0, 2)
      return item
    })

    return createResponse('获取评论成功', data)
  }

  async likeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.holeRepoService.processLike<Comment>({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
    })
  }

  async deleteLikeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
    })
  }

  async replyComment(dto: CreateCommentReplyDto, reqUser: IUser) {
    const comment = await this.commentRepo.findOne({ where: { id: dto.commentId } })
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const reply = this.replyRepo.create({
      body: dto.body,
      comment,
      user,
    })

    if (dto.replyId) {
      const parentReply = await this.replyRepo.findOne({
        relations: { user: true },
        where: { id: dto.replyId },
      })
      reply.replyUser = parentReply.user
      reply.parentReply = parentReply
    }

    await this.replyRepo.save(reply)

    return createResponse('回复成功', { id: reply.id })
  }

  async replyReply(dto: ReplyReplyDto, reqUser: IUser) {
    return createResponse('成功')
  }

  async getReplies(query: GetRepliesQuery, user: IUser) {
    const data = await paginate<Reply>(
      this.replyRepo,
      {
        limit: query.limit,
        page: query.page,
      },
      {
        relations: {
          user: true,
          comment: true,
        },
        where: {
          comment: {
            id: query.id,
          },
        },
        order: {
          favoriteCounts: 'ASC',
        },
      },
    )

    return createResponse('获取回复成功', data)
  }

  async likeReply(dto: LikeReplyDto, reqUser: IUser) {
    return this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
    })
  }

  async deleteReplyLike(dto: DeleteLikeReplyDto, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
    })
  }

  async search(query: SearchQuery) {
    const { keywords, ...paginationQuery } = query

    let searchOptions: FindManyOptions<Hole> = {
      relations: {
        user: true,
        vote: true,
        comments: { user: true },
        tags: true,
      },
      order: {
        createAt: 'DESC',
      },
    }

    if (keywords.startsWith('#')) {
      const keyword = keywords.slice(1)
      // hole id
      if (!isNaN(Number(keyword))) {
        searchOptions = {
          ...searchOptions,
          where: {
            id: Number(keyword),
          },
        }
      } else {
        // hole tag
        searchOptions = {
          ...searchOptions,
          where: {
            tags: {
              body: keyword,
            },
          },
        }
      }
    } else {
      // hole body
      searchOptions = {
        ...searchOptions,
        where: {
          body: Like(`%${keywords}%`),
        },
      }
    }

    const data = await paginate(this.holeRepo, paginationQuery, searchOptions)

    resolvePaginationHoleData(data, this.appConfig)

    return createResponse('查询成功', data)
  }
}
