/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 15:50:16
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import {
  ResourceRouteNames,
  RouteContract,
  RouteJSON,
  RouteMiddlewareHandler,
  RouteResourceContract,
} from "@ioc:Adonis/Core/Route";
import { ApplicationContract } from "@ioc:Adonis/Core/Application";
import {
  AccessRouteContract,
  ConfigAclContract,
} from "@ioc:Adonis/Addons/AdonisAccessControlList";
import { join } from "path";
import BaseUser from "../src/Models/BaseUser";
import Role from "../src/Models/Role";
import {LucidModel} from "@ioc:Adonis/Lucid/Orm";
import Access from "../src/Models/Access";
import Permission from "../src/Models/Permission";
import AuthorizeMiddleware from "../middleware/AuthorizeMiddleware";

export default class AccessControlProvider {
  public needApplication: boolean = true;

  constructor(protected app: ApplicationContract) {}

  private registerModel(){
    this.app.container.bind("Adonis/Addons/Acl/BaseUser", () => {
      return BaseUser;
    });
    this.app.container.bind("Adonis/Addons/Acl/Role", () => {
      return this.bootModel(Role);
    });
    this.app.container.bind("Adonis/Addons/Acl/Access", () => {
      return this.bootModel(Access);
    });
    this.app.container.bind("Adonis/Addons/Acl/Permission", () => {
      return this.bootModel(Permission);
    });
  }

  private registerMiddleware(){
    this.app.container.singleton('Adonis/Addons/Acl/Authorize', () => {
        return AuthorizeMiddleware;
    });
  }

  public register() {
    this.registerModel();
    this.registerMiddleware();
  }


  public boot() {
    const Route = this.app.container.use("Adonis/Core/Route");
    const configACL = this.app.container.use("Adonis/Core/Config").get("acl");

    Route.Route.macro("toJSON", this.toJSON);

    Route.Route.macro("access", this.accessCallbackFn);

    Route.RouteResource.macro("access", this.accessResourceCallbackFn);

    this.addWebPermission(configACL);
  }

  private accessCallbackFn(this: RouteContract, name, description, group) {
    const authorizeRoute: AccessRouteContract = {
      name: name,
      description: description || "",
      group: group,
    };

    (this as any).authorizeRoute = authorizeRoute;

    this.middleware([`can:${authorizeRoute.name}`]);
    return this;
  }

  private accessResourceCallbackFn(
    this: RouteResourceContract,
    name,
    description,
    group
  ) {
    const replaceList = { index: "list", store: "create" };
    const map: [string, string[]][] = [
      ["List", ["index"]],
      ["create", ["store", "create"]],
      ["Update", ["edit", "update"]],
      ["Show", ["show"]],
      ["delete", ["destroy"]],
    ];
    const middlewareMap: {
      [P in ResourceRouteNames]?:
        | RouteMiddlewareHandler
        | RouteMiddlewareHandler[];
    } = {};
    this.routes.forEach((route) => {
      const routeTag = route.name.replace(/.*\.([a-z])/, "$1");
      const [label] = map.find(([_, tags]) => tags.includes(routeTag))!;

      const authorizeRoute: AccessRouteContract = {
        name: `${replaceList[routeTag] || routeTag}_${name}`,
        description: `${label} ${description}`,
        group: group,
      };

      (route as any).authorizeRoute = authorizeRoute;
      middlewareMap[route.name] = [`can:${authorizeRoute.name}`];
    });
    this.middleware(middlewareMap);
    return this;
  }

  /***
   * Overlade
   */
  private toJSON() {
    const that = this as any;
    return {
      domain: that.routeDomain,
      pattern: that.computePattern(),
      matchers: that.getMatchers(),
      meta: {
        ...that.meta,
        namespace: that.routeNamespace,
        authorizeRoute: that.authorizeRoute,
      },
      name: that.name,
      handler: that.handler,
      methods: that.methods,
      middleware: that.routeMiddleware.flat(),
    } as RouteJSON;
  }

  private addWebPermission(configACL: ConfigAclContract) {
    if (configACL.apiOnly) return;

    const Route = this.app.container.use("Adonis/Core/Route");
    const View = this.app.container.use("Adonis/Core/View");
    View.mount("acl", join(__dirname, "..", "resources/views"));
    // All service for assign access to permission
    const service = Route.group(() => {
      Route.get("permissions", "PermissionController.new").as(
        "acl.permissions.index"
      );

      Route.get("permissions/new", "PermissionController.new").as(
        "acl.permissions.new"
      );

      Route.post("permissions", "PermissionController.store").as(
        "acl.permissions.store"
      );

      Route.get("permissions/:id", "PermissionController.show").as(
        "acl.permissions.show"
      );

      Route.put("permissions/:id", "PermissionController.update").as(
        "acl.permissions.update"
      );

      Route.delete("permissions/:id", "PermissionController.destroy").as(
        "acl.permissions.destroy"
      );

      Route.post(
        "permissions/:id/accesses/sync",
        "PermissionController.sync"
      ).as("acl.permissions.accesses.sync");
    }).namespace(join(__dirname, "..", "src/Controllers"));
    // Add middleware to route group
    if (configACL.middlewares) {
      service.middleware(configACL.middlewares);
    }

    if (configACL.prefix) {
      service.prefix(configACL.prefix);
    }
  }

  private bootModel(model: LucidModel):LucidModel{
    if(!model.booted) {
      model.boot();
    }
    return model;
  }
}