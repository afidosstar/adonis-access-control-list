/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:56:46
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import {
  DatabaseQueryBuilderContract,
  QueryClientContract,
  TransactionClientContract,
} from "@ioc:Adonis/Lucid/Database";
import { Database } from "@adonisjs/lucid/build/src/Database";
import Config from "@ioc:Adonis/Core/Config";

function builQuery(
  trx?: TransactionClientContract
): DatabaseQueryBuilderContract<any> {
  const { permissionAccess, permissionRole, permissionUser, userRole } =
    Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
    .query()
    .from("accesses")
    .distinct("slug")
    .leftJoin(permissionAccess, `${permissionAccess}.access_id`, "accesses.id")
    .leftJoin(
      "permissions",
      `${permissionAccess}.permission_id`,
      "permissions.id"
    )
    .leftJoin(
      "permissions",
      `${permissionAccess}.permission_id`,
      "permissions.id"
    )

    .leftJoin(
      permissionUser,
      `${permissionUser}.permission_id`,
      "permissions.id"
    )
    .leftJoin(
      permissionRole,
      `${permissionRole}.permission_id`,
      "permissions.id"
    )
    .leftJoin("roles", `${permissionRole}.roles_id`, "roles.id")
    .leftJoin(`${userRole}`, `${userRole}.roles_id`, "roles.id");
}

export async function getUserAccessSlug(
  userId: number,
  trx?: TransactionClientContract
): Promise<Array<string>> {
  const { permissionUser, userRole } = Config.get("acl.joinTables");
  return builQuery(trx)
    .where(`${permissionUser}.user_id`, userId)
    .orWhere(`${userRole}.user_id`, userId);
}

export function checkAccess(
  userId: number,
  slug: string,
  trx?: TransactionClientContract
): Promise<boolean> {
  const { permissionUser, userRole } = Config.get("acl.joinTables");
  return builQuery(trx)
    .where((qb) =>
      qb
        .where(`${permissionUser}.user_id`, userId)
        .orWhere(`${userRole}.user_id`, userId)
    )
    .where("accesses.slug", slug)
    .then((res) => res.length > 0);
}

export async function checkAccesses(accesses: string[], slugs: string[]) {
  return slugs.every((slug) => accesses.includes(slug));
}
