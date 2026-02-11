/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */



declare module '@ioc:Adonis/Addons/Acl/Models/Permission' {
  import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
  import { DateTime } from 'luxon'

  export interface PermissionAttributesMixin extends LucidRow{
    name: string;
    slug: string;
    description: string;
    route: string;
    group: string;
    createdAt: DateTime;
    updatedAt: DateTime;
    deletedAt?: DateTime;
  }
  interface PermissionMixin extends LucidModel{
    new (...args: any[]): PermissionAttributesMixin;
  }

  const Permission: PermissionMixin;
  export default Permission
}

declare module '@ioc:Adonis/Addons/Acl/Models/Role' {
  import { LucidModel, LucidRow, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
  import { DateTime } from 'luxon'
  import Permission from "@ioc:Adonis/Addons/Acl/Models/Permission";

  export interface RoleAttributesMixin extends LucidRow {
    id: number;
    name: string;
    slug: string;
    description: string;
    permissions: ManyToMany<typeof Permission>;
    createdAt: DateTime;
    updatedAt: DateTime;
    deletedAt?: DateTime;
  }

  interface  RoleModelMixin extends LucidModel{
    new (...args: any[]): RoleAttributesMixin;
  }

  const Role: RoleModelMixin
  export default Role
}

declare module '@ioc:Adonis/Addons/Acl' {
  import { LucidModel, LucidRow, ManyToMany, ColumnOptions } from '@ioc:Adonis/Lucid/Orm'
  import { RouteMiddlewareHandler } from '@ioc:Adonis/Core/Route'
  import { NormalizeConstructor } from '@poppinss/utils/build/src/Helpers'
  import Permission from '@ioc:Adonis/Addons/Acl/Models/Permission'
  import Role from '@ioc:Adonis/Addons/Acl/Models/Role'

  export type AccessRouteContract = {
    name: string
    description: string
    group?: string
  }

  export interface ConfigAclContract {
    prefix?: string
    middlewares?: RouteMiddlewareHandler | RouteMiddlewareHandler[]
    joinTables: {
      permissionRole: string;
      permissionUser: string;
      userRole: string
    }
    apiOnly: boolean
    superAdminRole?: string
  }

  export type AclAuthDecorator = (target: LucidRow, property: string) => void

  export type AclAuthUser = {
    roles: ManyToMany<typeof Role>
    permissions: ManyToMany<typeof  Permission>

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

  interface AuthUserFn {
    (options?: Partial<ColumnOptions & { isUpdated?: boolean }>): AclAuthDecorator
  }

  type ExtendUser = <T extends NormalizeConstructor<LucidModel>>(superclass: T) => T & {
    new (...args: any[]): AclAuthUser
  }

  export const authUser: AuthUserFn
  export const BaseUser: ExtendUser
}
