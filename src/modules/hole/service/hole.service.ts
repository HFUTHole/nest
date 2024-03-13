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
  Not,
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
import { AppConfig } from '@/app.config'
import {
  HoleDetailCommentMode,
  HoleDetailCommentOrderMode,
  HoleReplyOrderMode,
} from '@/modules/hole/hole.constant'
import { SearchQuery } from '@/modules/hole/dto/search.dto'
import {
  addCommentIsLiked,
  addReplyIsLiked,
  isVoteExpired,
  resolvePaginationHoleData,
} from '@/modules/hole/hole.utils'
import { HoleRepoService } from '@/modules/hole/service/hole.repo'
import { VoteItem } from '@/entity/hole/VoteItem.entity'
import { ArticleCategory } from '@/entity/article_category/ArticleCategory.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import { NotifyEventType } from '@/common/enums/notify/notify.enum'
import { ellipsisBody } from '@/utils/string'
import { HoleCategoryEntity } from '@/entity/hole/category/HoleCategory.entity'
import { RoleService } from '@/modules/role/role.service'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { Limit } from '@/constants/limit'

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

  @InjectRepository(ArticleCategory)
  private readonly articleCategoryRepo: Repository<ArticleCategory>

  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(HoleCategoryEntity)
  private readonly holeCategoryRepo: Repository<HoleCategoryEntity>

  @InjectEntityManager()
  private readonly manager: EntityManager

  @Inject()
  private readonly notifyService: NotifyService

  @Inject()
  private readonly holeRepoService: HoleRepoService

  @Inject()
  private readonly roleService: RoleService

  @Inject()
  private readonly userLevelService: UserLevelService

  constructor(private readonly appConfig: AppConfig) {}

  async getList(query: GetHoleListQuery, reqUser: IUser) {
    const data = await this.holeRepoService.getList(query, reqUser)

    return createResponse('获取成功', data)
  }

  async delete(body: DeleteHoleDto, reqUser: IUser) {
    const hole = await this.holeRepo.findOne({
      relations: { user: true },
      where: { id: body.id },
      select: { user: { studentId: true } },
    })

    const isAdmin = await this.roleService.isAdmin(reqUser.studentId)

    if (hole.user.studentId !== reqUser.studentId || !isAdmin) {
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
    const vote = await this.holeRepoService.findVote(query, reqUser)

    const data = await this.holeRepo
      .createQueryBuilder('hole')
      .setFindOptions({
        relations: {
          user: true,
          category: true,
          classification: true,
        },
        where: {
          id: query.id,
        },
        select: {
          user: {
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('hole.isLiked', 'hole.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .loadRelationCountAndMap('hole.commentCounts', 'hole.comments')
      .getOne()

    data.vote = vote

    return createResponse('获取树洞详情成功', data as any)
  }

  async likeHole(dto: GetHoleDetailQuery, reqUser: IUser) {
    const result = this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.holeRepo,
      propertyPath: 'favoriteHole',
      entity: Hole as any,
      type: '帖子',
      notifyProps: {
        holeId: dto.id,
      },
    })

    return result
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
    const classification = await this.holeCategoryRepo.findOne({

      where: {
        name: dto.classification,
      },
    })





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
      bilibili: dto.bilibili,
      title: dto.title,
      classification,
      category: this.articleCategoryRepo.create({
        category: dto.category,
      }),
    })

    if (dto.vote) {
      const votes = dto.vote.items.map((item) =>
        this.voteItemRepo.create({
          option: item,
        }),
      )

      hole.vote = this.voteRepo.create({
        items: votes,
        type: VoteType.single,
        hole,
      })
    }

    await this.manager.transaction(async (t) => {
      await t.save(hole)
      await this.userLevelService.incExperience(
        { studentId: reqUser.studentId, increment: Limit.level.hole },
        t,
      )
    })

    await this.holeRepo.save(hole)

    return createResponse('创建树洞成功', {
      id: hole.id,
      incExperience: Limit.level.hole,
    })
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

    const savedComment = await this.commentRepo.save(comment)
    await this.userLevelService.incExperience({
      increment: Limit.level.comment,
      studentId: reqUser.studentId,
    })
    await this.notifyService.createInteractionNotify({
      type: NotifyEventType.comment,
      reqUser,
      body: `${user.username} 评论了你的帖子：${ellipsisBody(dto.body, 30)}`,
      recipientId: hole.user.studentId,
      commentId: savedComment.id as string,
    })

    return createResponse('留言成功', {
      id: comment.id,
      incExperience: Limit.level.comment,
    })
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
          ...(dto.commentId && { id: Not(dto.commentId) }),
        },
        select: {
          user: {
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('comment.repliesCount', 'comment.replies')

    addCommentIsLiked(commentQuery, reqUser)

    const data = await paginate<Comment>(commentQuery, {
      limit: dto.limit,
      page: dto.page,
    })

    if (dto.commentId && dto.page === 1) {
      const commentBuilder = this.commentRepo
        .createQueryBuilder('comment')
        .setFindOptions({
          relations: { user: true, replies: { user: true } },
          where: {
            id: dto.commentId,
          },
        })
        .loadRelationCountAndMap('comment.repliesCount', 'comment.replies')

      addCommentIsLiked(commentBuilder, reqUser)

      const comment = await commentBuilder.getOne()

      // 标明为从通知模块点击来的评论
      comment.isNotification = true

      data.items.unshift(comment)
    }

    // TODO use queryBuilder to solve this problem
    ;(data as any).items = data.items.map((item) => {
      item.replies = item.replies.slice(0, 2)
      return item
    })

    return createResponse('获取评论成功', {
      ...data,
      incExperience: Limit.level.comment,
    })
  }

  async likeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.holeRepoService.processLike<Comment>({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
      entity: Comment as any,
      type: '评论',
      notifyProps: {
        commentId: dto.id,
      },
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
    const comment = await this.commentRepo.findOne({
      relations: { user: true },
      where: { id: dto.commentId },
      select: {
        user: {
          studentId: true,
          id: true,
        },
      },
    })
    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    const reply = this.replyRepo.create({
      body: dto.body,
      imgs: dto.imgs,
      comment,
      user,
    })

    if (dto.replyId) {
      const parentReply = await this.replyRepo.findOne({
        relations: { user: true },
        where: { id: dto.replyId },
        select: {
          user: {
            studentId: true,
            id: true,
          },
        },
      })
      reply.replyUser = parentReply.user
      reply.parentReply = parentReply
    }

    const savedReply = await this.replyRepo.save(reply)

    await this.userLevelService.incExperience({
      studentId: reqUser.studentId,
      increment: Limit.level.reply,
    })

    await this.notifyService.createInteractionNotify({
      type: NotifyEventType.reply,
      reqUser,
      body: `${user.username} 回复了你：${ellipsisBody(dto.body, 30)}`,
      recipientId: dto.replyId
        ? reply.parentReply.user.studentId
        : comment.user.studentId,
      replyId: savedReply.id as string,
    })

    return createResponse('回复成功', { id: reply.id, incExperience: Limit.level.reply })
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
        select: {
          user: {
            username: true,
            avatar: true,
          },
        },
      })

    addCommentIsLiked(commentQuery, reqUser)

    const comment = await commentQuery.getOne()

    const queryBuilder = this.replyRepo.createQueryBuilder('reply').setFindOptions({
      relations: {
        user: true,
        replyUser: true,
      },
      where: {
        comment: {
          id: query.id,
        },
        ...(query.replyId && { id: Not(query.replyId) }),
      },
      order: {
        ...(isFavoriteOrder ? { favoriteCounts: 'DESC' } : { createAt: 'ASC' }),
      },
    })

    addReplyIsLiked(queryBuilder, reqUser)

    const data = await paginate<Reply>(queryBuilder, {
      limit: query.limit,
      page: query.page,
    })

    if (query.replyId && query.page === 1) {
      const parentReply = (
        await this.replyRepo.findOne({
          relations: {
            parentReply: true,
          },
          where: {
            id: query.replyId,
          },
        })
      ).parentReply

      const replyBuilder = this.replyRepo.createQueryBuilder('reply').setFindOptions({
        relations: { user: true, replyUser: true },
        where: [
          {
            id: query.replyId,
          },
          {
            id: parentReply?.id,
          },
        ],
      })

      addReplyIsLiked(replyBuilder, reqUser)

      const reply = await replyBuilder.getMany()

      // 标明为从通知模块点击来的评论
      data.items.unshift(
        ...(reply.map((item) => ({
          ...item,
          isNotification: true,
        })) as Reply[]),
      )
    }

    return createResponse('获取回复成功', {
      ...data,
      comment,
      repliesCount: data.meta.totalItems,
    })
  }

  async likeReply(dto: LikeReplyDto, reqUser: IUser) {
    return this.holeRepoService.processLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
      entity: Reply as any,
      type: '回复',
      notifyProps: {
        replyId: dto.id,
      },
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
    const isExist = await this.userRepo.findOneBy({
      studentId: reqUser.studentId,
      votes: { id: dto.id },
    })

    if (isExist) {
      throw new ConflictException('你已经投过票了')
    }

    const vote = await this.voteRepo.findOneBy({ id: dto.id })

    if (vote.type === VoteType.single && dto.ids.length > 1) {
      throw new BadRequestException('该投票为单选')
    }

    if (isVoteExpired(vote)) {
      throw new ConflictException('该投票已过期')
    }

    await this.voteItemRepo.increment({ id: In(dto.ids) }, 'count', 1)

    const voteItems = await this.voteItemRepo.findBy({ id: In(dto.ids) })

    const user = await this.userRepo.findOneBy({ studentId: reqUser.studentId })

    // 处理投票
    await this.manager.transaction(async (t) => {
      await t
        .getRepository(User)
        .createQueryBuilder()
        .relation(User, 'votes')
        .of(user)
        .add(vote)

      await t
        .getRepository(User)
        .createQueryBuilder()
        .relation(User, 'voteItems')
        .of(user)
        .add(voteItems)
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
