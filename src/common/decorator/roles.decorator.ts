import { SetMetadata } from '@nestjs/common'
import { Role } from '@/modules/role/role.constant'

export const ROLES_KEY = 'roles'
export const Roles = (roles: Role[] = [Role.User, Role.Admin]) =>
  SetMetadata(ROLES_KEY, roles)
