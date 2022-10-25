/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Addons/AdonisAccessControlList" {
  import {
    ColumnOptions,
    LucidRow,
    LucidModel,
    ManyToMany,
  } from "@ioc:Adonis/Lucid/Orm";
  import { RouteMiddlewareHandler } from "@ioc:Adonis/Core/Route";
  import { DateTime } from "luxon";
  import { NormalizeConstructor } from "@poppinss/utils/build/src/Helpers";

  export type AccessRouteContract = {
    name: string;
    description: string;
    group?: string;
  };

  export interface ConfigAclContract {
    prefix: string | undefined;
    middlewares?: RouteMiddlewareHandler | RouteMiddlewareHandler[];
    joinTables: {
      permissionAccess: string;
      permissionRole: string;
      permissionUser: string;
      userRole: string;
    };
    apiOnly: boolean;
  }

  export type AclAuthDecorator = (target: LucidRow, property: string) => void;

  export type AclAuthUser<K extends LucidModel, J extends LucidModel> = {
    roles: ManyToMany<K>;
    permissions: ManyToMany<J>;
    getAccesses(): Promise<string[]>;

    can(slug: string): Promise<boolean>;

    getRoles(): Promise<string[]>;

    getPermissions(): Promise<string[]>;
  };

  interface AuthUserFn {
    (
      options?: Partial<ColumnOptions & { isUpdated?: boolean }>
    ): AclAuthDecorator;
  }
  type ExtendUser = <
    T extends NormalizeConstructor<LucidModel>,
    K extends LucidModel,
    J extends LucidModel
  >(
    superclass: T
  ) => T & {
    new (...args: any[]): AclAuthUser<K, J>;
  };
  type AccessType = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      group: string;
      route: string;
      slug: string;
      description?: string;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  type PermissionType = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      slug: string;
      description: string;
      accesses: ManyToMany<AccessType>;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  type RoleType<T extends LucidModel> = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      slug: string;
      description: string;
      permissions: ManyToMany<T>;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser;
  export const Access: { new (...args: any[]): AccessType };
  export const Permission: { new (...args: any[]): PermissionType };
  export const Role: { new (...args: any[]): RoleType<PermissionType> };
}
