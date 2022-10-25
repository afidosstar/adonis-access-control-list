/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:56:37
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */
/// <reference types="@adonisjs/lucid" />

import "reflect-metadata";
import { LucidModel } from "@ioc:Adonis/Lucid/Orm";
import { AclAuthDecorator, AuthUserFn } from "@ioc:Adonis/Addons/Acl";
// import {
//   GuardContract,
//   GuardsList,
//   ProvidersList,
// } from "@ioc:Adonis/Addons/Auth";

export const authUser: AuthUserFn = function (
  options = { isUpdated: false }
): AclAuthDecorator {
  return function (target, property) {
    const Model = target.constructor as LucidModel;
    options = Object.assign({ isUpdated: false }, options || {});
    Model.boot();
    Model.$addColumn(property, options);
    Model.before(
      options.isUpdated ? "update" : "create",
      async function (entity) {
        const auth = this.container.use("Adonis/Addons/Auth");
        // const ctx = HttpContext.get();
        // if (!ctx) {
        //   return;
        // }
        // const auth = ctx.auth as GuardContract<
        //   keyof ProvidersList,
        //   keyof GuardsList
        // >;
        if (!auth) {
          return;
        }
        const user: any = await auth.authenticate();
        if (!user) {
          return;
        }
        entity[property] = user.id;
      }
    );
  };
};
