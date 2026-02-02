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
import Config from "@ioc:Adonis/Core/Config";
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

    // Si pas de slug ACL, on passe sans vérification
    if (!slug) {
      return next();
    }

    // auth.authenticate() lance déjà une exception si l'utilisateur n'est pas authentifié
    // Pas besoin de vérifier if (!user)
    const user = (await auth.authenticate()) as AclAuthUser;

    // Vérifier si l'utilisateur est super admin
    const superAdminRole = Config.get("acl.superAdminRole");
    if (superAdminRole && (await user.isSuperAdmin())) {
      return next();
    }

    if (await user.can(slug)) {
      return next();
    }

    throw new AccessDeniedException(
      "You are not authorized to access this resource"
    );
  }
}
