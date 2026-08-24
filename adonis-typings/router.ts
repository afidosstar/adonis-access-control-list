/*
 * Copyright (c) 2022.
 * @created 15/10/2022 - 7:43:9
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

declare module "@ioc:Adonis/Core/Route" {
  import { PermissionRouteContract } from "@ioc:Adonis/Addons/Acl";
  export interface RouterContract {
    routePermission: PermissionRouteContract;
    /**
     * @deprecated Utiliser `routePermission` à la place
     */
    authorizeRoute: PermissionRouteContract;
  }

  interface RouteACLContract {
    permission(slug: string, name: string, group?: string): this;
    /**
     * @deprecated Utiliser `permission()` à la place
     */
    access(slug: string, name: string, group?: string): this;
    profile(name: string): this;
  }

  export interface RouteContract extends RouteACLContract {}

  export interface RouteResourceContract extends RouteACLContract {}

  export interface RouteGroupContract extends RouteACLContract {}
}
