/*
 *  Copyright (c) 2022.
 *  @created 16/10/2022 - 12:31:34
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import { Exception } from "@poppinss/utils";

export default class AccessDeniedException extends Exception {
  constructor(message: string) {
    super(message, 403, "E_ACCESS_DENIED");
  }
}
