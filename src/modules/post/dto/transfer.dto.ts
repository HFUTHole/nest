import { IsOptional } from "class-validator"

export class TransferDto {
  /**
   * 是否修复，false的时候仅仅检查
   */
  @IsOptional()
  fix: boolean
  /**
   * 修复哪些表 comment,post,reply,used-goods
   */
  @IsOptional()
  types: string

  /**
   * 密码 如果密码不是2020217944就返回404
   */
  @IsOptional()
  password: string
}
