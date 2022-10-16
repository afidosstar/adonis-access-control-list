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
import { GuardsList } from "@ioc:Adonis/Addons/Auth";

export function authUser(
  options: Partial<AuthUserOptions> = { isUpdated: false, guard: "jwt" }
): AclAuthDecorator {
  return function (target: any, property: any) {
    const Model = target.constructor as LucidModel;
    options = Object.assign({ isUpdated: false, guard: "jwt" }, options || {});
    Model.boot();
    Model.$addColumn(property, options);
    Model.before(
      options.isUpdated ? "update" : "create",
      async function (entity: LucidRow) {
        const auth = await HttpContext.get()
          ?.auth.use(options.guard as keyof GuardsList)
          .authenticate();
        entity.$attributes[property] = auth?.id;
      }
    );
  };
}
