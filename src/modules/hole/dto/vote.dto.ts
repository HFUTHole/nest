import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString } from 'class-validator'
import { IsHoleExist, IsVoteExist } from '@/modules/hole/dto/utils.dto'
import { Limit } from '@/constants/limit'

export class PostVoteDto {
  @IsHoleExist()
  @IsNumber()
  id: number

  @IsVoteExist({
    each: true,
  })
  @ArrayMaxSize(Limit.holeVoteMaxLength, {
    message: `最多只能选${Limit.holeVoteMaxLength}个选项哦`,
  })
  @ArrayMinSize(1, { message: '至少要有一个投票哦' })
  @IsArray()
  ids: string[] = []
}
