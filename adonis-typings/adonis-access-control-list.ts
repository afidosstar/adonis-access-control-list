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
  export type AccessModelType = LucidModel & {
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
  const Access: AccessModelType;
  export default Access;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Permission" {
  import { LucidModel, LucidRow, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { DateTime } from "luxon";
  import { AccessModelType } from "@ioc:Adonis/Addons/Acl/Models/Access";
  export type PermissionModelType = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      slug: string;
      description: string;
      accesses: ManyToMany<AccessModelType>;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  const Permission: PermissionModelType;
  export default Permission;
}

declare module "@ioc:Adonis/Addons/Acl/Models/Role" {
  import { LucidModel, LucidRow, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { PermissionModelType } from "@ioc:Adonis/Addons/Acl/Models/Permission";
  import { DateTime } from "luxon";
  export type RoleModelType = LucidModel & {
    new (...args: any[]): LucidRow & {
      id: number;
      name: string;
      slug: string;
      description: string;
      permissions: ManyToMany<PermissionModelType>;
      createdAt: DateTime;
      updatedAt: DateTime;
    };
  };
  const Role: RoleModelType;
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

  export type AclAuthUser = {
    roles: ManyToMany<RoleModelType>;
    permissions: ManyToMany<PermissionModelType>;
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
  type ExtendUser = <T extends NormalizeConstructor<LucidModel>>(
    superclass: T
  ) => T & {
    new (...args: any[]): AclAuthUser;
  };

  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser;
}
