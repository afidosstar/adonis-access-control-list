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
import Permission from "./Permission";
import Role from "./Role";
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

    /**
     * Récupère tous les slugs de permissions accessibles par l'utilisateur
     */
    public getAccesses(): Promise<string[]> {
      return getUserAccessSlug(this.$primaryKeyValue as number, this.$trx);
    }

    /**
     * Vérifie si l'utilisateur a une permission spécifique
     * @param slug - Le slug de la permission (ex: 'users.create')
     */
    public async can(slug: string): Promise<boolean> {
      return checkAccess(this.$primaryKeyValue as number, slug, this.$trx);
    }

    /**
     * Récupère tous les slugs de rôles de l'utilisateur
     */
    public async getRoles(): Promise<string[]> {
      return getUserRoles(this.$primaryKeyValue as number, this.$trx);
    }

    /**
     * Récupère tous les slugs de permissions de l'utilisateur
     */
    public async getPermissions(): Promise<string[]> {
      return getUserPermissions(this.$primaryKeyValue as number, this.$trx);
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     * @param slug - Le slug du rôle (ex: 'admin')
     */
    public async hasRole(slug: string): Promise<boolean> {
      const roles = await this.getRoles();
      return roles.includes(slug);
    }

    /**
     * Vérifie si l'utilisateur a au moins un des rôles
     * @param slugs - Tableau de slugs de rôles
     */
    public async hasAnyRole(slugs: string[]): Promise<boolean> {
      const roles = await this.getRoles();
      return slugs.some((slug) => roles.includes(slug));
    }

    /**
     * Vérifie si l'utilisateur a tous les rôles
     * @param slugs - Tableau de slugs de rôles
     */
    public async hasAllRoles(slugs: string[]): Promise<boolean> {
      const roles = await this.getRoles();
      return slugs.every((slug) => roles.includes(slug));
    }

    /**
     * Vérifie si l'utilisateur a une permission spécifique (alias de can)
     * @param slug - Le slug de la permission
     */
    public async hasPermission(slug: string): Promise<boolean> {
      return this.can(slug);
    }

    /**
     * Vérifie si l'utilisateur a au moins une des permissions
     * @param slugs - Tableau de slugs de permissions
     */
    public async hasAnyPermission(slugs: string[]): Promise<boolean> {
      const checks = await Promise.all(slugs.map((slug) => this.can(slug)));
      return checks.some((result) => result);
    }

    /**
     * Vérifie si l'utilisateur a toutes les permissions
     * @param slugs - Tableau de slugs de permissions
     */
    public async hasAllPermissions(slugs: string[]): Promise<boolean> {
      const checks = await Promise.all(slugs.map((slug) => this.can(slug)));
      return checks.every((result) => result);
    }

    /**
     * Vérifie si l'utilisateur est super admin
     */
    public async isSuperAdmin(): Promise<boolean> {
      const superAdminRole = Config.get("acl.superAdminRole", "super_admin");
      return this.hasRole(superAdminRole);
    }

    /**
     * Charge les rôles et permissions en une seule fois (eager loading)
     */
    public async loadPermissions(): Promise<void> {
      await this.load((loader) => {
        // @ts-ignore
        loader.load("roles").load("permissions");
      });
    }
  }

  return Mixin;
}
