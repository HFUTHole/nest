import { Repository } from 'typeorm'
import { IUser } from '@/app'
import { User } from '@/entity/user/user.entity'
import { CommonEntity } from '@/common/entity/common.entity'

interface IdAbleDto {
  id: string | number
}

export interface ILikeableEntity extends CommonEntity {
  favoriteUsers: User[]
}

export interface IProcessLikeOptions<T extends ILikeableEntity> {
  dto: IdAbleDto

  repo: Repository<T>

  propertyPath: keyof User

  reqUser: IUser
}
