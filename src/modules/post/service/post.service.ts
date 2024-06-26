import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { Post } from '@/entity/post/post.entity'
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
import { CreatePostDto } from '@/modules/post/dto/create.dto'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { paginate } from 'nestjs-typeorm-paginate'
import {
  CreateCommentDto,
  CreateCommentReplyDto,
  GetPostCommentDto,
  LikeCommentDto,
} from '@/modules/post/dto/comment.dto'
import { Comment } from '@/entity/post/comment.entity'
import {
  DeletePostDto,
  GetPostDetailQuery,
  GetPostListQuery,
  PostListMode,
} from '@/modules/post/dto/post.dto'
import { Reply } from '@/entity/post/reply.entity'
import {
  DeleteLikeReplyDto,
  GetRepliesQuery,
  LikeReplyDto,
} from '@/modules/post/dto/replies.dto'
import { Tags } from '@/entity/post/tags.entity'
import { Vote, VoteType } from '@/entity/post/vote.entity'
import { PostVoteDto } from '@/modules/post/dto/vote.dto'
import { NotifyService } from '@/modules/notify/notify.service'
import { AppConfig } from '@/app.config'
import {
  PostDetailCommentMode,
  PostDetailCommentOrderMode,
} from '@/modules/post/post.constant'
import { SearchQuery } from '@/modules/post/dto/search.dto'
import {
  addCommentIsLiked,
  addReplyIsLiked,
  getIpAddress,
  isVoteExpired,
  resolveEntityImgUrl,
  resolvePaginationPostData,
} from '@/modules/post/post.utils'
import { PostRepoService } from '@/modules/post/service/post.repo'
import { VoteItem } from '@/entity/post/VoteItem.entity'
import { NotifyInteractionEntity } from '@/entity/notify/notify-interaction.entity'
import {
  InteractionNotifyTargetType,
  NotifyEventType,
} from '@/common/enums/notify/notify.enum'
import { ellipsisBody } from '@/utils/string'
import { PostCategoryEntity } from '@/entity/post/category/PostCategory.entity'
import { RoleService } from '@/modules/role/role.service'
import { UserLevelService } from '@/modules/user/service/user-level.service'
import { Limit } from '@/constants/limit'
import * as _ from 'lodash'
import { GetPostTagDetailQuery, GetPostTagListQuery } from '@/modules/post/dto/tag.dto'
import { UsedGoodsEntity } from '@/entity/used-goods/used-goods.entity'
import { GoodsCreateCommentDto } from '@/modules/used-goods/dto/comment.dto'
import axios from 'axios'

@Injectable()
export class PostService {
  @InjectRepository(Post)
  private readonly postRepo: Repository<Post>

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

  @InjectRepository(NotifyInteractionEntity)
  private readonly notifyInteractionRepo: Repository<NotifyInteractionEntity>

  @InjectRepository(PostCategoryEntity)
  private readonly postCategoryRepo: Repository<PostCategoryEntity>

  @InjectEntityManager()
  private readonly manager: EntityManager

  @Inject()
  private readonly notifyService: NotifyService

  @Inject()
  private readonly postRepoService: PostRepoService

  @Inject()
  private readonly roleService: RoleService

  @Inject()
  private readonly userLevelService: UserLevelService

  constructor(private readonly appConfig: AppConfig) {}

  async getList(query: GetPostListQuery, reqUser: IUser) {
    const data = await this.postRepoService.getList(query, reqUser)

    return createResponse('获取成功', data)
  }

  async getFollowList(query: GetPostListQuery, reqUser: IUser) {
    const data = await this.postRepoService.getList(query, reqUser, {
      follow: true,
    })

    return createResponse('获取成功', data)
  }

  async delete(body: DeletePostDto, reqUser: IUser) {
    const post = await this.postRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: body.id,
      },
      select: {
        id: true,
        user: { id: true },
        isHidden: true,
      },
    })

    const isAdmin = await this.roleService.isAdmin(reqUser.studentId)

    if (post.user.id !== reqUser.id && !isAdmin) {
      throw new ForbiddenException('这不是你的树洞哦')
    }

    post.isHidden = true

    await this.postRepo.save(post)

    return createResponse('删除成功')
  }

  async getTags() {
    return this.tagsRepo.find({
      relations: {
        posts: true,
      },
      where: { posts: { id: 5 } },
    })
  }

  async getDetail(query: GetPostDetailQuery, reqUser: IUser) {
    const vote = await this.postRepoService.findVote(query, reqUser)

    const data = await this.postRepo
      .createQueryBuilder('post')
      .setFindOptions({
        relations: {
          user: true,
          tags: true,
        },
        where: {
          id: query.id,
        },
        select: {
          user: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      })
      .loadRelationCountAndMap('post.isLiked', 'post.favoriteUsers', 'isLiked', (qb) =>
        qb.andWhere('isLiked.studentId = :studentId', {
          studentId: reqUser.studentId,
        }),
      )
      .loadRelationCountAndMap('post.commentCounts', 'post.comments')
      .getOne()

    data.vote = vote

    resolveEntityImgUrl(this.appConfig, data, {
      quality: 70,
    })

    return createResponse('获取树洞详情成功', data as any)
  }

  async likePost(dto: GetPostDetailQuery, reqUser: IUser) {
    return this.postRepoService.processLike({
      dto,
      reqUser,
      repo: this.postRepo,
      propertyPath: 'favoritePost',
      entity: Post as any,
      type: '帖子',
      notifyProps: {
        postId: dto.id,
      },
      target: InteractionNotifyTargetType.post,
    })
  }

  async deleteLike(dto: GetPostDetailQuery, reqUser: IUser) {
    return this.postRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.postRepo,
      propertyPath: 'favoritePost',
      entity: Post as any,
      target: InteractionNotifyTargetType.post,
    })
  }

  async create(dto: CreatePostDto, reqUser: IUser, ip: string) {
    const user = await this.userRepo.findOne({
      where: { studentId: reqUser.studentId },
    })

    const tags = dto.tags.map((tag) =>
      this.tagsRepo.create({
        body: tag,
      }),
    )

    const ipAddr = await getIpAddress(ip)

    const post = this.postRepo.create({
      user,
      body: dto.body,
      imgs: dto.imgs,
      tags,
      bilibili: dto.bilibili,
      title: dto.title,
      ip_location: ipAddr.ip_location,
    })

    if (dto.vote) {
      const votes = dto.vote.items.map((item) =>
        this.voteItemRepo.create({
          option: item,
        }),
      )

      post.vote = this.voteRepo.create({
        items: votes,
        type: VoteType.single,
        post,
      })
    }

    await this.manager.transaction(async (t) => {
      await t.save(post)
      await this.userLevelService.incExperience(
        { studentId: reqUser.studentId, increment: Limit.level.post },
        t,
      )
    })

    await this.postRepo.save(post)

    return createResponse('创建树洞成功', {
      id: post.id,
      incExperience: Limit.level.post,
    })
  }

  async createComment(dto: CreateCommentDto, reqUser: IUser, ip: string) {
    const post = await this.postRepo.findOne({
      relations: { user: true },
      select: { user: { studentId: true } },
      where: { id: dto.id },
    })

    const shouldIncreaseExp = dto.body.length >= 15

    const comment = await this._createComment(dto, reqUser, {
      post,
      ip,
    })

    return createResponse('留言成功', {
      ...comment,
      incExperience: shouldIncreaseExp ? Limit.level.comment : 0,
    })
  }

  async _createComment(
    dto: Omit<CreateCommentDto | GoodsCreateCommentDto, 'id'> & { id?: string | number },
    reqUser: IUser,
    options: {
      post?: Post
      goods?: UsedGoodsEntity
      ip: string
    },
  ) {
    const user = await this.userRepo.findOneBy({
      studentId: reqUser.studentId,
    })

    const ip = await getIpAddress(options.ip)

    const comment = this.commentRepo.create({
      body: dto.body,
      user,
      ip_location: ip.ip_location,
      imgs: dto.imgs,
    })

    if (options.post) {
      comment.post = options.post
    }

    if (options.goods) {
      comment.goods = options.goods
    }

    const recipientId = options.post
      ? options.post.user.studentId
      : options.goods.creator.studentId

    const savedComment = await this.commentRepo.save(comment)
    if (dto.body.length >= 5) {
      await this.userLevelService.incExperience({
        increment: Limit.level.comment,
        studentId: reqUser.studentId,
      })
    }
    await this.notifyService.createInteractionNotify({
      type: NotifyEventType.comment,
      reqUser,
      body: `${ellipsisBody(dto.body, 30)}`,
      recipientId,
      commentId: savedComment.id as string,
      target: options?.post
        ? InteractionNotifyTargetType.post
        : InteractionNotifyTargetType.usedGoods,
      usedGoodsId: options?.goods?.id,
      postId: options?.post?.id!,
    })

    return comment
  }

  async getComment(dto: GetPostCommentDto, reqUser: IUser) {
    const post = await this.postRepo.findOne({
      relations: {
        user: true,
      },
      select: {
        user: {
          id: true,
          studentId: true,
        },
      },
      where: { id: dto.id },
    })

    const isFavoriteOrder = dto.order === PostDetailCommentOrderMode.favorite

    const order: FindOptionsOrder<Comment> = {
      ...(isFavoriteOrder
        ? { favoriteCounts: 'DESC', createAt: 'desc' }
        : { createAt: 'DESC' }),
    }

    const commentQuery = this.commentRepo
      .createQueryBuilder('comment')
      .setFindOptions({
        relations: { user: true, replies: { user: true, replyUser: true } },
        order,
        where: {
          post: { id: dto.id },
          ...(dto.mode === PostDetailCommentMode.author && {
            user: { studentId: post.user.studentId },
          }),
          ...(dto.commentId && { id: Not(dto.commentId) }),
        },
        select: {
          user: {
            id: true,
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

    let reply: Reply | undefined = undefined
    let parentReply: Reply | undefined = undefined

    if (dto.replyId) {
      reply = await this.replyRepo.findOne({
        where: {
          id: dto.replyId,
        },
        relations: {
          parentReply: true,
          user: true,
        },
        select: {
          user: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      })

      parentReply = await this.replyRepo.findOne({
        where: {
          id: reply?.parentReply?.id,
        },
        relations: {
          parentReply: true,
          user: true,
        },
        select: {
          user: {
            username: true,
            avatar: true,
            id: true,
          },
        },
      })
    }

    // TODO use queryBuilder to solve this problem
    ;(data as any).items = data.items.map((item) => {
      item.replies = item.replies.slice(0, 1)

      // comment imgs
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 50,
      })

      // comment replies imgs
      item.replies.forEach((reply) =>
        resolveEntityImgUrl(this.appConfig, reply, {
          quality: 50,
        }),
      )

      if (item.id === dto.commentId) {
        const items = [parentReply, reply].filter(Boolean)

        const isReplyRepeated = [reply?.id, parentReply?.id]?.includes(
          item.replies[0]?.id,
        )
        if (!isReplyRepeated) {
          items.push(item.replies[0])
        }
        item.replies.unshift(...items)
      }

      item.replies = _.uniqWith(item.replies, _.isEqual)

      return item
    })

    return createResponse('获取评论成功', {
      ...data,
      incExperience: Limit.level.comment,
    })
  }

  async likeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.postRepoService.processLike<Comment>({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
      entity: Comment as any,
      type: '评论',
      notifyProps: {
        commentId: dto.id,
      },
      target: InteractionNotifyTargetType.comment,
    })
  }

  async deleteLikeComment(dto: LikeCommentDto, reqUser: IUser) {
    return this.postRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.commentRepo,
      propertyPath: 'favoriteComment',
      entity: Comment as any,
      target: InteractionNotifyTargetType.comment,
    })
  }

  async replyComment(dto: CreateCommentReplyDto, reqUser: IUser, ip: string) {
    const comment = await this.commentRepo.findOne({
      relations: { user: true, post: true },
      where: { id: dto.commentId },
      select: {
        post: {
          id: true,
        },
        user: {
          avatar: true,
          username: true,
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
            avatar: true,
            username: true,
            studentId: true,
            id: true,
          },
        },
      })
      reply.replyUser = parentReply.user
      reply.parentReply = parentReply
    }

    const ipAddr = await getIpAddress(ip)

    reply.ip_location = ipAddr.ip_location

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
      usedGoodsId: dto?.goodsId,
      postId: comment?.post?.id,
      target:
        dto.type === 'goods'
          ? InteractionNotifyTargetType.usedGoods
          : InteractionNotifyTargetType.comment,
    })

    return createResponse('回复成功', {
      id: reply.id,
      incExperience: Limit.level.reply,
      ...reply,
    })
  }

  async getReplies(query: GetRepliesQuery, reqUser: IUser) {
    const queryBuilder = this.replyRepo.createQueryBuilder('reply').setFindOptions({
      relations: {
        user: true,
        replyUser: true,
      },
      where: {
        ...(query.replyId && { id: Not(query.replyId) }),
        comment: {
          id: query.id,
        },
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
        order: {
          createAt: 'DESC',
          favoriteCounts: 'DESC',
        },
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

      // const reply = await replyBuilder.getMany()
      //
      // // 标明为从通知模块点击来的评论
      // data.items.unshift(
      //   ...(reply.map((item) => ({
      //     ...item,
      //     isNotification: true,
      //   })) as Reply[]),
      // )
    }

    data.items.map((item) => {
      resolveEntityImgUrl(this.appConfig, item, {
        quality: 50,
      })
    })

    return createResponse('获取回复成功', {
      ...data,
      repliesCount: data.meta.totalItems,
    })
  }

  async likeReply(dto: LikeReplyDto, reqUser: IUser) {
    return this.postRepoService.processLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
      entity: Reply as any,
      type: '回复',
      notifyProps: {
        replyId: dto.id,
      },
      target: InteractionNotifyTargetType.reply,
    })
  }

  async deleteReplyLike(dto: DeleteLikeReplyDto, reqUser: IUser) {
    return this.postRepoService.processDeleteLike({
      dto,
      reqUser,
      repo: this.replyRepo,
      propertyPath: 'favoriteReply',
      entity: Reply as any,
      target: InteractionNotifyTargetType.reply,
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

    let searchOptions: FindManyOptions<Post> = {
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
      // post id
      if (!isNaN(Number(keyword))) {
        searchOptions = {
          ...searchOptions,
          where: {
            id: Number(keyword),
          },
        }
      } else {
        // post tag
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
      // post body
      searchOptions = {
        ...searchOptions,
        where: {
          body: Like(`%${keywords}%`),
        },
      }
    }

    const data = await paginate(this.postRepo, paginationQuery, searchOptions)

    resolvePaginationPostData(data, this.appConfig)

    return createResponse('查询成功', data)
  }

  async getCategories() {
    const categories = await this.postCategoryRepo.find()

    return createResponse('获取列表成功', categories)
  }

  async getTagPostList(query: GetPostTagListQuery, reqUser: IUser) {
    const getListQuery: GetPostListQuery = {
      ...query,
      mode: PostListMode.latest,
    }

    const list = await this.postRepoService.getList(getListQuery, reqUser, {
      tag: {
        body: query.tag,
      },
    })

    return createResponse('获取Tag帖子列表成功', list)
  }

  async getTagDetail(query: GetPostTagDetailQuery, reqUser: IUser) {
    const tag = await this.tagsRepo
      .createQueryBuilder('tags')
      .setFindOptions({
        where: {
          body: query.tag,
        },
      })
      .getOne()

    await this.tagsRepo
      .createQueryBuilder()
      .update(tag)
      .set({ views: () => 'views + 1' })
      .execute()

    return createResponse('获取tag详情成功', tag)
  }
}
