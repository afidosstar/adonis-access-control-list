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

import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import _ from "lodash";
import AccessDeniedException from "../Exceptions/AccessDiniedException";

export  default class AuthorizeMiddleware {
  public async handle({auth, route}: HttpContextContract, next: () => Promise<void>, allowedAccesses: string[]) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (_.has(route, 'meta.authorizeRoute')) {
      return next();
    }

    const user = await auth.authenticate() as any;
    if(await user.can(allowedAccesses[0])){
      return next();
    }


    throw new AccessDeniedException("You are not authorized to access this resource");
  }
}
