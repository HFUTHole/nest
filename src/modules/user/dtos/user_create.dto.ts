import { Gender } from '@/entity/user/user.entity'

export class UserCreateDto {
  studentId: number

  username: string

  password: string

  gender: Gender
}
