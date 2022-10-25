/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Addons/Acl/Models/Access" {
  import { LucidModel, LucidRow } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
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
  const Access: AccessType;
  export default Access;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Permission" {
  import { LucidModel, LucidRow, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
  import AccessType from "@ioc:Adonis/Addons/Acl/Models/Access";
  type PermissionType<T extends LucidModel> = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      slug: string;
      description: string;
      accesses: ManyToMany<T>;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  const Permission: PermissionType<typeof AccessType>;
  export default Permission;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Role" {
  import { LucidModel, LucidRow, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import PermissionType from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { DateTime } from "luxon";
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
  const Role: RoleType<typeof PermissionType>;
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
  import PermissionType from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import RoleType from "@ioc:Adonis/Addons/Acl/Models/Role";

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
  type ExtendUser<K extends LucidModel, J extends LucidModel> = <
    T extends NormalizeConstructor<LucidModel>
  >(
    superclass: T
  ) => T & {
    new (...args: any[]): AclAuthUser<K, J>;
  };

  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser<typeof RoleType, typeof PermissionType>;
}
