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

import { LucidModel, LucidRow } from "@ioc:Adonis/Lucid/Orm";
import HttpContext from "@ioc:Adonis/Core/HttpContext";
import {
  AclAuthDecorator,
  AuthUserOptions,
} from "@ioc:Adonis/Addons/AdonisAccessControlList";
import { GuardContract, ProvidersList } from "@ioc:Adonis/Addons/Auth";

export function authUser(
  options: Partial<AuthUserOptions> = { isUpdated: false }
): AclAuthDecorator {
  return function (target, property) {
    const Model = target.constructor as LucidModel;
    options = Object.assign({ isUpdated: false }, options || {});
    Model.boot();
    Model.$addColumn(property, options);
    Model.before(
      options.isUpdated ? "update" : "create",
      async function (entity: LucidRow) {
        const ctx = HttpContext.get();
        if (!ctx) {
          return;
        }
        const auth = ctx.auth as GuardContract<keyof ProvidersList, any>;
        if (!auth) {
          return;
        }
        const user = await auth.authenticate();
        if (!user) {
          return;
        }
        entity[property] = user.id;
      }
    );
  };
}
