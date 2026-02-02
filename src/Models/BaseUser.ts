/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:55:46
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import {
  column,
  LucidModel,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { NormalizeConstructor } from "@poppinss/utils/build/src/Helpers";
import Config from "@ioc:Adonis/Core/Config";
import {
  checkAccess,
  getUserAccessSlug,
  getUserPermissions,
  getUserRoles,
} from "../utils";
import Permission from "@ioc:Adonis/Addons/Acl/Models/Permission";
import Role from "@ioc:Adonis/Addons/Acl/Models/Role";
const { permissionUser, userRole } = Config.get("acl.joinTables");

/**
 * This is the base user model that you should extend from for your user model.
 *
 * @param superclass
 * @constructor
 */
export function BaseUser<T extends NormalizeConstructor<LucidModel>>(
  superclass: T
) {
  class Mixin extends superclass {
    @column({ isPrimary: true })
    public id: number;

    @manyToMany(() => Role, {
      pivotTable: userRole,
      relatedKey: "id",
      pivotForeignKey: "user_id",
      pivotRelatedForeignKey: "role_id",
    })
    public roles: ManyToMany<typeof Role>;

    @manyToMany(() => Permission, {
      pivotTable: permissionUser,
      relatedKey: "id",
      pivotForeignKey: "user_id",
      pivotRelatedForeignKey: "permission_id",
    })
    public permissions: ManyToMany<typeof Permission>;

    public getAccesses(): Promise<string[]> {
      return getUserAccessSlug(this.$primaryKeyValue as number, this.$trx);
    }

    public async can(slug: string): Promise<boolean> {
      return checkAccess(this.$primaryKeyValue as number, slug, this.$trx);
    }

    public async getRoles(): Promise<string[]> {
      return getUserRoles(this.$primaryKeyValue as number, this.$trx);
    }

    public async getPermissions(): Promise<string[]> {
      return getUserPermissions(this.$primaryKeyValue as number, this.$trx);
    }
  }

  return Mixin;
}
