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
  import { AccessRouteContract } from "@ioc:Adonis/Addons/AdonisAccessControlList";
  export interface RouterContract {
    authorizeRoute: AccessRouteContract;
  }

  interface RouteACLContract {
    access(name: string, description?: string, group?: string): this;
    profile(name: string): this;
  }

  export interface RouteContract extends RouteACLContract {}

  export interface RouteResourceContract extends RouteACLContract {}

  export interface RouteGroupContract extends RouteACLContract {}
}
