/*
 * @created 13/10/2022 - 16:38
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Addons/AdonisAccessControlList" {
  import { ColumnOptions, LucidRow } from "@ioc:Adonis/Lucid/Orm";
  import { GuardsList } from "@ioc:Adonis/Addons/Auth";
  import { LucidModel, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { RouteMiddlewareHandler } from "@ioc:Adonis/Core/Route";

  export interface AuthUserOptions extends ColumnOptions {
    isUpdated: boolean;
  }

  export interface AccessRouteContract {
    name: string;
    description: string;
    group?: string;
  }

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

  export interface AclAuthUser {
    getAccesses(): Promise<string[]>;

    can(slug: string): Promise<boolean>;

    getRoles(): Promise<string[]>;

    getPermissions(): Promise<string[]>;
  }
}
