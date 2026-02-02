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

import Database, {
  DatabaseQueryBuilderContract,
  QueryClientContract,
  TransactionClientContract,
} from "@ioc:Adonis/Lucid/Database";
import Config from "@ioc:Adonis/Core/Config";

function buildQuery(
  trx?: TransactionClientContract
): DatabaseQueryBuilderContract<any> {
  const { permissionRole, permissionUser, userRole } =
    Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
    .query()
    .from("permissions")
    .distinct("permissions.slug")
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
    .leftJoin("roles", `${permissionRole}.role_id`, "roles.id")
    .leftJoin(`${userRole}`, `${userRole}.role_id`, "roles.id");
}

export async function getUserAccessSlug(
  userId: number,
  trx?: TransactionClientContract
): Promise<Array<string>> {
  const { permissionUser, userRole } = Config.get("acl.joinTables");
  return buildQuery(trx)
    .where((qb) => {
      qb.where(`${permissionUser}.user_id`, userId)
        .orWhere(`${userRole}.user_id`, userId)
    })
    .then((res) => {
      return res.map((r) => r.slug);
    });
}

/**
 * Vérifie si un slug correspond à un pattern wildcard
 * Exemples:
 * - "users.*" correspond à "users.create", "users.update", etc.
 * - "*" correspond à tout
 */
function matchesWildcard(permission: string, requested: string): boolean {
  // Exact match
  if (permission === requested) {
    return true;
  }

  // Wildcard universel
  if (permission === "*") {
    return true;
  }

  // Wildcard partiel (ex: "users.*" correspond à "users.create")
  if (permission.endsWith(".*")) {
    const prefix = permission.slice(0, -2); // Enlève ".*"
    return requested.startsWith(prefix + ".");
  }

  return false;
}

export async function checkAccess(
  userId: number,
  slug: string,
  trx?: TransactionClientContract
): Promise<boolean> {
  const { permissionUser, userRole } = Config.get("acl.joinTables");

  // Récupère toutes les permissions de l'utilisateur
  const userPermissions = await buildQuery(trx)
    .where((qb) =>
      qb
        .where(`${permissionUser}.user_id`, userId)
        .orWhere(`${userRole}.user_id`, userId)
    )
    .then((res) => res.map((r) => r.slug));

  // Vérifie si une permission correspond (exact ou wildcard)
  return userPermissions.some((permission) => matchesWildcard(permission, slug));
}

export function getUserRoles(
  userId: number,
  trx?: TransactionClientContract
): Promise<Array<string>> {
  const { userRole } = Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
    .query()
    .from("roles")
    .distinct("roles.slug")
    .leftJoin(userRole, `${userRole}.role_id`, "roles.id")
    .where(`${userRole}.user_id`, userId)
    .then((res) => {
      return res.map((r) => r.slug);
    });
}

export function getUserPermissions(
  userId: number,
  trx?: TransactionClientContract
): Promise<Array<string>> {
  const { permissionRole, permissionUser, userRole } =
    Config.get("acl.joinTables");
  return ((trx || Database) as QueryClientContract | TransactionClientContract)
    .query()
    .from("permissions")
    .distinct("permissions.slug")
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
    .leftJoin("roles", `${permissionRole}.role_id`, "roles.id")
    .leftJoin(userRole, `${userRole}.role_id`, "roles.id")
    .where((qb) => {
      qb.where(`${userRole}.user_id`, userId)
        .orWhere(`${permissionUser}.user_id`, userId)
    })
    .then((res) => {
      return res.map((r) => r.slug);
    });
}
