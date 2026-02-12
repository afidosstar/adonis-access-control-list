/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Addons/Acl/Helpers/SoftDeletes" {
  import { LucidModel, ModelQueryBuilderContract } from "@ioc:Adonis/Lucid/Orm";
  import { QueryClientContract } from "@ioc:Adonis/Lucid/Database";
  import { DateTime } from "luxon";
  type WithSoftDeletes<T extends LucidModel> = T & {
    new (...args: any[]): InstanceType<T> & {
      deletedAt: DateTime | null;
      readonly trashed: boolean;
      $forceDelete: boolean;

      $getQueryFor(
        action: "insert",
        client: QueryClientContract
      ): ReturnType<QueryClientContract["insertQuery"]>;
      $getQueryFor(
        action: "update" | "delete" | "refresh",
        client: QueryClientContract
      ): ModelQueryBuilderContract<T>;

      // Méthodes d'instance ajoutées
      delete(): Promise<void>; // soft delete
      restore(): Promise<any>;
      forceDelete(): Promise<void>;
    };
    // Méthodes statiques / query scopes (ajoutées sur la classe)
    ignoreDeleted<Model extends LucidModel & T>(
      query: ModelQueryBuilderContract<Model, InstanceType<Model>>
    ): void;
    ignoreDeletedPaginate<
      Model extends LucidModel & T,
      Result = InstanceType<Model>
    >([countQuery, query]: [
      ModelQueryBuilderContract<Model, Result>,
      ModelQueryBuilderContract<Model, Result>
    ]): void;
    disableIgnore<Model extends LucidModel & T, Result = InstanceType<Model>>(
      this: Model,
      query: ModelQueryBuilderContract<Model, Result>
    ): ModelQueryBuilderContract<Model, Result>;
    withTrashed<Model extends LucidModel & T, Result = InstanceType<Model>>(
      this: Model
    ): ModelQueryBuilderContract<Model, Result>;
    onlyTrashed<Model extends LucidModel & T, Result = InstanceType<Model>>(
      this: Model
    ): ModelQueryBuilderContract<Model, Result>;
  };
}
declare module "@ioc:Adonis/Addons/Acl/Models/Permission" {
  import {
    LucidModel,
    LucidRow,
    ModelQueryBuilderContract,
  } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
  import { WithSoftDeletes } from "@ioc:Adonis/Addons/Acl/Helpers/SoftDeletes";

  export interface Permission extends LucidRow {
    id: number;
    name: string;
    slug: string;
    description: string;
    route: string;
    group: string;
    createdAt: DateTime;
    updatedAt: DateTime;
  }

  export type PermissionModel = WithSoftDeletes<
    LucidModel & (new (...args: any[]) => Permission)
  >;

  const Permission: PermissionModel;
  export default Permission;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Role" {
  import {
    LucidModel,
    LucidRow,
    ManyToMany,
    ModelQueryBuilderContract,
  } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
  import { PermissionModel } from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { WithSoftDeletes } from "@ioc:Adonis/Addons/Acl/Helpers/SoftDeletes";

  export interface Role extends LucidRow {
    id: number;
    name: string;
    slug: string;
    description: string;
    permissions: ManyToMany<PermissionModel>;
    createdAt: DateTime;
    updatedAt: DateTime;
  }

  export type RoleModel = WithSoftDeletes<
    LucidModel & (new (...args: any[]) => Role)
  >;

  const Role: RoleModel;
  export default Role;
}

declare module "@ioc:Adonis/Addons/Acl" {
  import {
    LucidModel,
    LucidRow,
    ManyToMany,
    ColumnOptions,
  } from "@ioc:Adonis/Lucid/Orm";
  import { RouteMiddlewareHandler } from "@ioc:Adonis/Core/Route";
  import { NormalizeConstructor } from "@poppinss/utils/build/src/Helpers";
  import { PermissionModel } from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { RoleModel } from "@ioc:Adonis/Addons/Acl/Models/Role";

  export interface AccessRouteContract {
    slug: string;
    name: string;
    group?: string;
  }
  export interface PermissionRouteContract extends AccessRouteContract {
    route: string;
    description?: string;
  }

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

  export interface AclAuthUser {
    roles: ManyToMany<RoleModel>;
    permissions: ManyToMany<PermissionModel>;

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
  }

  export interface AuthUserFn {
    (
      options?: Partial<ColumnOptions & { isUpdated?: boolean }>
    ): AclAuthDecorator;
  }

  export type ExtendUser = <T extends NormalizeConstructor<LucidModel>>(
    superclass: T
  ) => T & {
    new (...args: any[]): AclAuthUser;
  };

  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser;
}
