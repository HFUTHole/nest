import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { RolesGuard } from '@/modules/role/role.guard'
import { RoleController } from './role.controller'
import {
  IsUserExistConstraint,
  IsUsernameExistConstraint,
} from '@/modules/user/dtos/utils.dto'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [RoleService, RolesGuard, IsUserExistConstraint, IsUsernameExistConstraint],
  controllers: [RoleController],
})
export class RoleModule {}
