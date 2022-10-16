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

import { LucidModel, ManyToMany, manyToMany } from "@ioc:Adonis/Lucid/Orm";
import { NormalizeConstructor } from "@poppinss/utils/build/src/Helpers";
import Role from "./Role";
import Permission from "./Permission";
import Config from "@ioc:Adonis/Core/Config";
import {checkAccess, getUserAccessSlug, getUserPermissions, getUserRoles} from "../utils";
const { permissionUser, userRole } = Config.get("acl.joinTables");

/**
 * This is the base user model that you should extend from for your user model.
 *
 * @param superclass
 * @constructor
 */
export default function BaseUser<T extends NormalizeConstructor<LucidModel>>(
  superclass: T
) {
  class Mixin extends superclass {
    @manyToMany(() => Role, {
      pivotTable: userRole,
      pivotForeignKey: "user_id",
      pivotRelatedForeignKey: "role_id",
    })
    public roles: ManyToMany<typeof Role>;

    @manyToMany(() => Permission, {
      pivotTable: permissionUser,
      pivotForeignKey: "user_id",
      pivotRelatedForeignKey: "permission_id",
    })
    public permissions: ManyToMany<typeof Permission>;


    public getAccesses(): Promise<string[]> {
      return getUserAccessSlug(
        this.$attributes[this.$primaryKeyValue || "id"],
        this.$trx
      );
    }

    public async can(slug: string): Promise<boolean> {
      return checkAccess(this.$attributes[this.$primaryKeyValue || "id"], slug, this.$trx);
    }

    public async getRoles(): Promise<string[]> {
      return getUserRoles(this.$attributes[this.$primaryKeyValue || "id"], this.$trx);
    }
    public async getPermissions(): Promise<string[]> {
      return getUserPermissions(this.$attributes[this.$primaryKeyValue || "id"], this.$trx);
    }
  }
  return Mixin;
}
