/*
 *  Copyright (c) 2022.
 *  @created 16/10/2022 - 12:11:34
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import AccessDeniedException from "../Exceptions/AccessDiniedException";
import { AclAuthUser } from "@ioc:Adonis/Addons/Acl";
import AuthNotConfiguredException from "../Exceptions/AuthNotConfiguredException";
import get from "lodash/get";

export default class AuthorizeMiddleware {
  public async handle(
    { auth, route }: HttpContextContract,
    next: () => Promise<void>
  ) {
    if (!auth) {
      throw new AuthNotConfiguredException();
    }
    const slug = get(route, "meta.authorizeRoute.name");
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!slug) {
      return next();
    }

    const user = (await auth.authenticate()) as AclAuthUser;
    if (await user.can(slug)) {
      return next();
    }

    throw new AccessDeniedException(
      "You are not authorized to access this resource",
      403,
      "E_ACCESS_DENIED"
    );
  }
}
