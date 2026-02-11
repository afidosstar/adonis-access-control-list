/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

declare module '@ioc:Adonis/Addons/Acl/Models/Permission' {
  import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
  import { DateTime } from 'luxon'
  import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'

  export interface Permission extends LucidRow {
    id: number
    name: string
    slug: string
    description: string
    route: string
    group: string
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime
  }

  export type PermissionModel = LucidModel & {
    new (...args: any[]): Permission
  } & typeof SoftDeletes

  const Permission: PermissionModel
  export default Permission
}

declare module '@ioc:Adonis/Addons/Acl/Models/Role' {
  import { LucidModel, LucidRow, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
  import { DateTime } from 'luxon'
  import { SoftDeletes } from '@ioc:Adonis/Addons/LucidSoftDeletes'
  import { PermissionModel } from '@ioc:Adonis/Addons/Acl/Models/Permission'

  export interface Role extends LucidRow {
    id: number
    name: string
    slug: string
    description: string
    permissions: ManyToMany<PermissionModel>
    createdAt: DateTime
    updatedAt: DateTime
    deletedAt?: DateTime
  }

  export type RoleModel = LucidModel & {
    new (...args: any[]): Role
  } & typeof SoftDeletes

  const Role: RoleModel
  export default Role
}

declare module '@ioc:Adonis/Addons/Acl' {
  import { LucidModel, LucidRow, ManyToMany, ColumnOptions } from '@ioc:Adonis/Lucid/Orm'
  import { RouteMiddlewareHandler } from '@ioc:Adonis/Core/Route'
  import { NormalizeConstructor } from '@poppinss/utils/build/src/Helpers'
  import { PermissionModel } from '@ioc:Adonis/Addons/Acl/Models/Permission'
  import { RoleModel } from '@ioc:Adonis/Addons/Acl/Models/Role'

  export interface AccessRouteContract {
    name: string
    description: string
    group?: string
  }

  export interface ConfigAclContract {
    prefix?: string
    middlewares?: RouteMiddlewareHandler | RouteMiddlewareHandler[]
    joinTables: {
      permissionRole: string
      permissionUser: string
      userRole: string
    }
    apiOnly: boolean
    superAdminRole?: string
  }

  export type AclAuthDecorator = (target: LucidRow, property: string) => void

  export interface AclAuthUser {
    roles: ManyToMany<RoleModel>
    permissions: ManyToMany<PermissionModel>

    getAccesses(): Promise<string[]>
    can(slug: string): Promise<boolean>
    getRoles(): Promise<string[]>
    getPermissions(): Promise<string[]>

    hasRole(slug: string): Promise<boolean>
    hasAnyRole(slugs: string[]): Promise<boolean>
    hasAllRoles(slugs: string[]): Promise<boolean>

    hasPermission(slug: string): Promise<boolean>
    hasAnyPermission(slugs: string[]): Promise<boolean>
    hasAllPermissions(slugs: string[]): Promise<boolean>

    isSuperAdmin(): Promise<boolean>
    loadPermissions(): Promise<void>
  }

  export interface AuthUserFn {
    (options?: Partial<ColumnOptions & { isUpdated?: boolean }>): AclAuthDecorator
  }

  export type ExtendUser = <T extends NormalizeConstructor<LucidModel>>(superclass: T) => T & {
    new (...args: any[]): AclAuthUser
  }

  export const authUser: AuthUserFn
  export const BaseUser: ExtendUser
}
