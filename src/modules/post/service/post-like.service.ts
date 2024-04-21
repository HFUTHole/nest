import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { IUser } from '@/app'
import { createResponse } from '@/utils/create'
import { LikeCommentDto, LikePostDto, LikeReplyDto } from '../dto/post.dto'

@Injectable()
export class PostLikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likePost(dto: LikePostDto, reqUser: IUser) {
    const isLiked = await this.prisma.userLikePosts.findFirst({
      where: {
        postId: dto.id,
        userId: reqUser.id,
      },
    })

    if (isLiked) {
      throw new ConflictException('你已经点赞过了')
    }

    await this.prisma.userLikePosts.create({
      data: {
        userId: reqUser.id,
        postId: dto.id,
      },
    })

    return createResponse('点赞成功')
  }

  // async deletePostLike(dto: LikePostDto, reqUser: IUser) {
  //   const isLiked = await this.prisma.userLikePosts.findFirst({
  //     where: {
  //       postId: dto.id,
  //       userId: reqUser.id,
  //     },
  //   })
  //
  //   if (!isLiked) {
  //     throw new ConflictException('你没有点赞过')
  //   }
  //
  //   await this.prisma.userLikePosts.delete({
  //     where: {
  //       postId_userId: {
  //         userId: reqUser.id,
  //         postId: dto.id,
  //       },
  //     },
  //   })
  //
  //   return createResponse('成功取消点赞')
  // }
  //
  // async likeReply(dto: LikeReplyDto, reqUser: IUser) {
  //   const isLiked = await this.prisma.userLikeReplies.findFirst({
  //     where: {
  //       replyId: dto.id,
  //       userId: reqUser.id,
  //     },
  //   })
  //
  //   if (isLiked) {
  //     throw new ConflictException('你已经点赞过了')
  //   }
  //
  //   await this.prisma.userLikeReplies.create({
  //     data: {
  //       userId: reqUser.id,
  //       replyId: dto.id,
  //     },
  //   })
  //
  //   return createResponse('点赞成功')
  // }
  //
  // async deleteReplyLike(dto: LikeReplyDto, reqUser: IUser) {
  //   const isLiked = await this.prisma.userLikeReplies.findFirst({
  //     where: {
  //       replyId: dto.id,
  //       userId: reqUser.id,
  //     },
  //   })
  //
  //   if (!isLiked) {
  //     throw new ConflictException('你没有点赞过')
  //   }
  //
  //   await this.prisma.userLikeReplies.delete({
  //     where: {
  //       replyId_userId: {
  //         userId: reqUser.id,
  //         replyId: dto.id,
  //       },
  //     },
  //   })
  //
  //   return createResponse('成功取消点赞')
  // }
  //
  // async likeComment(dto: LikeCommentDto, reqUser: IUser) {
  //   const isLiked = await this.prisma.userLikeComments.findFirst({
  //     where: {
  //       commentId: dto.id,
  //       userId: reqUser.id,
  //     },
  //   })
  //
  //   if (isLiked) {
  //     throw new ConflictException('你已经点赞过了')
  //   }
  //
  //   await this.prisma.userLikeComments.create({
  //     data: {
  //       userId: reqUser.id,
  //       commentId: dto.id,
  //     },
  //   })
  //
  //   return createResponse('点赞成功')
  // }
  //
  // async deleteCommentLike(dto: LikeCommentDto, reqUser: IUser) {
  //   const isLiked = await this.prisma.userLikeComments.findFirst({
  //     where: {
  //       commentId: dto.id,
  //       userId: reqUser.id,
  //     },
  //   })
  //
  //   if (!isLiked) {
  //     throw new ConflictException('你没有点赞过')
  //   }
  //
  //   await this.prisma.userLikeComments.delete({
  //     where: {
  //       commentId_userId: {
  //         userId: reqUser.id,
  //         commentId: dto.id,
  //       },
  //     },
  //   })
  //
  //   return createResponse('成功取消点赞')
  // }
}
