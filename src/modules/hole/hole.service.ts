import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Hole } from '@/entity/hole/hole.entity'
import {
  EntityManager,
  FindManyOptions,
  FindOptionsOrder,
  In,
  Like,
  Repository,
} from 'typeorm'
import { User } from '@/entity/user/user.entity'
import { CreateHoleDto } from '@/modules/hole/dto/create.dto'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { paginate, PaginationTypeEnum } from 'nestjs-typeorm-paginate'
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
  HoleReplyOrderMode,
} from '@/modules/hole/hole.constant'
import { SearchQuery } from '@/modules/hole/dto/search.dto'
import { addCommentIsLiked, resolvePaginationHoleData } from '@/modules/hole/hole.utils'
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
    const queryBuilder = this.holeRepo
      .createQueryBuilder('hole')
      .leftJoinAndSelect('hole.user', 'user')
      .leftJoinAndSelect('hole.tags', 'tags')
      .leftJoinAndSelect('hole.vote', 'vote')
      .leftJoinAndSelect('hole.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'comment.user')

    if (query.mode === HoleListMode.random) {
      queryBuilder
        .addSelect('LOG10(hole.favoriteCounts + 100) * RAND(ABS(hole.id)) * 100', 'score')
        .orderBy('score', 'DESC')
    } else if (query.mode === HoleListMode.timeline) {
      queryBuilder.orderBy('hole.createAt', 'DESC')
    }

    const data = await paginate(queryBuilder, {
      ...query,
      paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    })

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

  async getDetail(query: GetHoleDetailQuery, reqUser: IUser) {
    const data = await this.holeRepo
      .createQueryBuilder('hole')
      .setFindOptions({
        relations: {
          user: true,
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
      .loadRelationCountAndMap('hole.commentCounts', 'hole.comments')
      .getOne()

    const vote = await this.holeRepoService.findVote(query)

    data.vote = vote

    return createResponse('获取树洞详情成功', data as any)
  }

  async likeHole(dto: GetHoleDetailQuery, reqUser: IUser) {
    return this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.holeRepo,
      propertyPath: 'favoriteHole',
      entity: Hole as any,
    })
  }

  async deleteLike(dto: GetHoleDetailQuery, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.holeRepo,
      propertyPath: 'favoriteHole',
      entity: Hole as any,
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
      imgs: dto.imgs,
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

  async getComment(dto: GetHoleCommentDto, reqUser: IUser) {
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

    const order: FindOptionsOrder<Comment> = {
      replies: {
        favoriteCounts: 'DESC',
      },
      ...(isFavoriteOrder ? { favoriteCounts: 'DESC' } : { createAt: 'DESC' }),
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

    addCommentIsLiked(commentQuery, reqUser)

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
      entity: Comment as any,
    })
  }

  async deleteLikeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
      entity: Comment as any,
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

  async getReplies(query: GetRepliesQuery, reqUser: IUser) {
    const isFavoriteOrder = query.order === HoleReplyOrderMode.favorite
    const commentQuery = await this.commentRepo
      .createQueryBuilder('comment')
      .setFindOptions({
        where: {
          id: query.id,
        },
        relations: {
          user: true,
        },
      })

    addCommentIsLiked(commentQuery, reqUser)

    const comment = await commentQuery.getOne()

    const queryBuilder = this.replyRepo
      .createQueryBuilder('reply')
      .setFindOptions({
        relations: {
          user: true,
          replyUser: true,
        },
        where: {
          comment: {
            id: query.id,
          },
        },
        order: {
          ...(isFavoriteOrder ? { favoriteCounts: 'DESC' } : { createAt: 'ASC' }),
        },
      })
      .loadRelationCountAndMap('reply.isLiked', 'reply.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )

    const data = await paginate<Reply>(queryBuilder, {
      limit: query.limit,
      page: query.page,
    })

    return createResponse('获取回复成功', {
      ...data,
      comment,
    })
  }

  async likeReply(dto: LikeReplyDto, reqUser: IUser) {
    return this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
      entity: Reply as any,
    })
  }

  async deleteReplyLike(dto: DeleteLikeReplyDto, reqUser: IUser) {
    return this.holeRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
      entity: Reply as any,
    })
  }

  async vote(dto: PostVoteDto, reqUser: IUser) {
    const isExist = await this.voteRepo.findOne({
      where: {
        id: dto.id,
        user: {
          studentId: reqUser.studentId,
        },
      },
    })

    if (isExist) {
      throw new ConflictException('你已经投过票了')
    }

    const vote = await this.voteRepo.findOneBy({ id: dto.id })

    if (vote.type === VoteType.single && dto.ids.length > 1) {
      throw new BadRequestException('该投票为单选')
    }

    await this.voteItemRepo.increment({ id: In(dto.ids) }, 'count', 1)

    const voteItems = await this.voteItemRepo.findBy({ vote: { id: dto.id } })
    vote.items = voteItems

    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    // 处理投票
    await this.manager.transaction(async (t) => {
      if (!user.votes) {
        user.votes = []
      }
      user.votes.push(vote)

      await this.userRepo.save(user)
    })

    return createResponse('投票成功')
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
