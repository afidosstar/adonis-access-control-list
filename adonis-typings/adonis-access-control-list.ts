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
  import { LucidModel, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
  import { RouteMiddlewareHandler } from "@ioc:Adonis/Core/Route";
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
      options: Partial<ColumnOptions & { isUpdated?: boolean }>
    ): AclAuthDecorator;
  }
  type ExtendUser = <
    T extends NormalizeConstructor<LucidModel>,
    K extends LucidModel,
    J extends LucidModel
  >(
    superclass: T
  ) => T & AclAuthUser<K, J>;
  export const authUser: AuthUserFn;
  export const BaseUser: ExtendUser;
}
