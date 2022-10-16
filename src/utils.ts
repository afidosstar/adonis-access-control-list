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

function buildQuery(
  trx?: TransactionClientContract
): DatabaseQueryBuilderContract<any> {
  const { permissionAccess, permissionRole, permissionUser, userRole } =
    Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
    .query()
    .from("accesses")
    .distinct("accesses.slug")
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
  return buildQuery(trx)
    .where(`${permissionUser}.user_id`, userId)
    .orWhere(`${userRole}.user_id`, userId).then((res) => {
      return res.map((r) => r.slug);
    });
}

export function checkAccess(
  userId: number,
  slug: string,
  trx?: TransactionClientContract
): Promise<boolean> {
  const { permissionUser, userRole } = Config.get("acl.joinTables");
  return buildQuery(trx)
    .where((qb) =>
      qb
        .where(`${permissionUser}.user_id`, userId)
        .orWhere(`${userRole}.user_id`, userId)
    )
    .where("accesses.slug", slug)
    .then((res) => res.length > 0);
}




export function getUserRoles(userId: number,trx?: TransactionClientContract){
  const { userRole } =
      Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
      .query()
      .from("roles")
      .distinct("roles.slug")
      .leftJoin(userRole, `${userRole}.role_id`, "roles.id")
      .where(`${userRole}.user_id`, userId).then((res) => {
        return res.map((r) => r.slug);
      });
}

export function getUserPermissions(userId: number,trx?: TransactionClientContract){
  const { permissionRole, permissionUser, userRole } =
      Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
      .query()
      .from("permissions")
      .distinct("permissions.slug")
      .leftJoin(permissionUser, `${permissionUser}.permission_id`, "permissions.id")
      .leftJoin(permissionRole, `${permissionRole}.permission_id`, "permissions.id")
      .leftJoin('roles', `${permissionRole}.role_id`, "roles.id")
      .leftJoin(userRole, `${userRole}.role_id`, "roles.id")
      .where(`${userRole}.user_id`, userId)
      .where(`${permissionUser}.user_id`, userId)
      .then((res) => {
        return res.map((r) => r.slug);
      });
}
