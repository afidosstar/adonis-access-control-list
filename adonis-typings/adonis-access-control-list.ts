/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
/// <reference types="@adonisjs/lucid" />
/// <reference types="@adonisjs/lucid" />

declare module "@ioc:Adonis/Addons/Acl/Models/Permission" {
  import { LucidModel, LucidRow } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
  // @ts-ignore
  import { SoftDeletes } from "adonis-lucid-soft-deletes";

  export interface PermissionInterface {
    id: number;
    name: string;
    slug: string;
    description: string;
    route: string;
    group: string;
    createdAt: DateTime;
    updatedAt: DateTime;
    deletedAt?: DateTime;
  }

  export type PermissionModelType = LucidModel & {
    new (...args: any[]): LucidRow & PermissionInterface;
  };

  const Permission: PermissionModelType & SoftDeletes;
  export default Permission;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Role" {
  import { LucidModel, LucidRow, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { PermissionModelType } from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { DateTime } from "luxon";
  // @ts-ignore
  import { SoftDeletes } from "adonis-lucid-soft-deletes";

  export interface RoleInterface {
    id: number;
    name: string;
    slug: string;
    description: string;
    permissions: ManyToMany<PermissionModelType>;
    createdAt: DateTime;
    updatedAt: DateTime;
    deletedAt?: DateTime;
  }

  export type RoleModelType = LucidModel & {
    new (...args: any[]): LucidRow & RoleInterface;
  };

  const Role: RoleModelType & SoftDeletes;

  export default Role;
}

declare module "@ioc:Adonis/Addons/Acl" {
  import {
    ColumnOptions,
    LucidRow,
    LucidModel,
    ManyToMany,
  } from "@ioc:Adonis/Lucid/Orm";
  import { RouteMiddlewareHandler } from "@ioc:Adonis/Core/Route";
  import { NormalizeConstructor } from "@poppinss/utils/build/src/Helpers";
  import { PermissionModelType } from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { RoleModelType } from "@ioc:Adonis/Addons/Acl/Models/Role";

  export type AccessRouteContract = {
    name: string;
    description: string;
    group?: string;
  };

  export interface ConfigAclContract {
    prefix?: string;
    middlewares?: RouteMiddlewareHandler | RouteMiddlewareHandler[];
    joinTables: {
      permissionRole: string;
      permissionUser: string;
      userRole: string;
    };
    apiOnly: boolean;
    superAdminRole?: string;
  }

  export type AclAuthDecorator = (target: LucidRow, property: string) => void;

  export type AclAuthUser = {
    roles: ManyToMany<RoleModelType>;
    permissions: ManyToMany<PermissionModelType>;

    getAccesses(): Promise<string[]>;
    can(slug: string): Promise<boolean>;
    getRoles(): Promise<string[]>;
    getPermissions(): Promise<string[]>;

    hasRole(slug: string): Promise<boolean>;
    hasAnyRole(slugs: string[]): Promise<boolean>;
    hasAllRoles(slugs: string[]): Promise<boolean>;

    hasPermission(slug: string): Promise<boolean>;
    hasAnyPermission(slugs: string[]): Promise<boolean>;
    hasAllPermissions(slugs: string[]): Promise<boolean>;

    isSuperAdmin(): Promise<boolean>;
    loadPermissions(): Promise<void>;
  };
  interface AuthUserFn {
    (
      options?: Partial<ColumnOptions & { isUpdated?: boolean }>
    ): AclAuthDecorator;
  }
  type ExtendUser = <T extends NormalizeConstructor<LucidModel>>(
    superclass: T
  ) => T & {
    new (...args: any[]): AclAuthUser;
  };

  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser;
}
