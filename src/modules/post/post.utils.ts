import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate'
import { Post } from '@/entity/post/post.entity'
import { getAvatarUrl } from '@/utils/user'
import { AppConfig } from '@/app.config'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { IUser } from '@/app'
import { Comment } from '@/entity/post/comment.entity'
import { Vote } from '@/entity/post/vote.entity'
import { User } from '@/entity/user/user.entity'
import { Reply } from '@/entity/post/reply.entity'
import { generateImgProxyUrl } from '@/utils/imgproxy'
import { IGenerateImageUrl } from '@imgproxy/imgproxy-node'
import axios from 'axios'

export const resolvePaginationPostData = (
  data: Pagination<Post, IPaginationMeta>,
  config: AppConfig,
) => {
  ;(data.items as any) = data.items.map((item) => {
    if (item.imgs) {
      item.imgs = item.imgs.map((imgUrl) => {
        return generateImgProxyUrl(config, imgUrl)
      })
    }

    if (item.user) {
      // 隐藏用户id
      item.user = {
        id: item.user.id,
        username: item.user.username,
        avatar: item.user.avatar,
      } as User
    }

    if (!item.user.avatar) {
      item.user.avatar = getAvatarUrl(config, item.user)
    }

    if (item.vote) {
      item.vote.totalCount = item.vote.items.reduce((prev, cur) => prev + cur.count, 0)
      item.vote.isExpired = isVoteExpired(item.vote)
    }

    // 隐藏评论用户id
    if (item.comments.length) {
      item.comments = item.comments.map((comment) => {
        comment.user = {
          id: comment.user.id,
          username: comment.user.username,
          avatar: comment.user.avatar,
        } as User

        return comment
      })
    }

    return {
      ...item,
      comments: item.comments.slice(0, 2),
      body: `${item.body.slice(0, 150)}${item.body.length > 150 ? '...' : ''}`,
      commentCounts: item.comments.length,
    }
  })
}

export const addCommentIsLiked = (query: SelectQueryBuilder<Comment>, reqUser: IUser) => {
  query.loadRelationCountAndMap(
    'comment.isLiked',
    'comment.favoriteUsers',
    'isLiked',
    (qb) =>
      qb.andWhere('isLiked.studentId = :studentId', {
        studentId: reqUser.studentId,
      }),
  )
}

export const addReplyIsLiked = (query: SelectQueryBuilder<Reply>, reqUser: IUser) => {
  query.loadRelationCountAndMap('reply.isLiked', 'reply.favoriteUsers', 'isLiked', (qb) =>
    qb.andWhere('isLiked.studentId = :studentId', {
      studentId: reqUser.studentId,
    }),
  )
}

export const isVoteExpired = (vote: Vote) => {
  return false
}

export const initPostDateSelect = (postRepo: Repository<Post>) =>
  postRepo
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('post.favoriteUsers', 'favoriteUser')
    .leftJoinAndSelect('post.tags', 'tags')
    .leftJoinAndSelect('post.vote', 'vote')
    .leftJoinAndSelect('vote.items', 'voteItems')
    .leftJoinAndSelect('post.comments', 'comments')
    .leftJoinAndSelect('comments.user', 'comment.user')

export const resolveEntityImgUrl = (
  appConfig: AppConfig,
  post: {
    imgs?: string[]
  },
  options: IGenerateImageUrl['options'] = {},
) => {
  if (post.imgs) {
    post.imgs = post.imgs.map((item) => {
      return item.startsWith('https')
        ? item
        : generateImgProxyUrl(appConfig, item, options)
    })
  }
}

interface IPData {
  ip: string
  dec: string
  country: string
  countryCode: string
  province: string
  city: string
  districts: string
  idc: string
  isp: string
  net: string
  zipcode: string
  areacode: string
  protocol: string
  location: string
  myip: string
  time: string
}

export const getIpAddress = async (ip: string) => {
  console.log('get IP address: ', ip)
  // 中国 安徽 宣城 联通
  const result = await axios<{ data: IPData }>({
    method: 'GET',
    url: 'https://api.mir6.com/api/ip',
    params: {
      ip,
      type: 'json',
    },
  })

  const data = result.data.data

  const meta = {
    country: data.country || '',
    province: data.province?.replace('省', '') || '',
    city: data.city.replace('市', ''),
    ip_location: '未知',
  }

  if (meta.country === '中国') {
    if ((meta.province === '安徽' && meta.city === '宣城') || meta.city === '合肥') {
      meta.ip_location = `${meta.province}${meta.city}`
    } else {
      meta.ip_location = meta.province
    }
  }

  return meta
}
