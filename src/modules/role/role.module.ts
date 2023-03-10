import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '@/entity/user/user.entity'
import { RolesGuard } from '@/modules/role/role.guard'

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [RoleService, RolesGuard],
})
export class RoleModule {}
