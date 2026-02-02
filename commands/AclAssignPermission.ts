/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:56:9
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */
import { BaseCommand, args, flags } from "@adonisjs/core/build/standalone";

export default class AclAssignPermission extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:assign:permission";

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    "Assigner une permission à un rôle ou un utilisateur";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @args.string({ description: "Slug de la permission" })
  public permissionSlug: string;

  @flags.string({ description: "Slug du rôle" })
  public role: string | null;

  @flags.number({ description: "ID de l'utilisateur" })
  public user: number | null;

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");
    const Config = this.application.container.use("Adonis/Core/Config");

    if (!this.role && !this.user) {
      this.logger.error("Vous devez spécifier soit --role soit --user");
      return;
    }

    if (this.role && this.user) {
      this.logger.error(
        "Vous ne pouvez spécifier qu'un seul: --role ou --user"
      );
      return;
    }

    try {
      // Récupérer la permission
      const permission = await Database.from("permissions")
        .where("slug", this.permissionSlug)
        .first();

      if (!permission) {
        this.logger.error(`Permission "${this.permissionSlug}" introuvable`);
        return;
      }

      if (this.role) {
        // Assigner à un rôle
        const role = await Database.from("roles")
          .where("slug", this.role)
          .first();

        if (!role) {
          this.logger.error(`Rôle "${this.role}" introuvable`);
          return;
        }

        const { permissionRole } = Config.get("acl.joinTables");
        await Database.table(permissionRole).insert({
          permission_id: permission.id,
          role_id: role.id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        this.logger.success(
          `Permission "${this.permissionSlug}" assignée au rôle "${this.role}"`
        );
      } else if (this.user) {
        // Assigner à un utilisateur
        const user = await Database.from("users")
          .where("id", this.user)
          .first();

        if (!user) {
          this.logger.error(`Utilisateur #${this.user} introuvable`);
          return;
        }

        const { permissionUser } = Config.get("acl.joinTables");
        await Database.table(permissionUser).insert({
          permission_id: permission.id,
          user_id: this.user,
          created_at: new Date(),
          updated_at: new Date(),
        });

        this.logger.success(
          `Permission "${this.permissionSlug}" assignée à l'utilisateur #${this.user}`
        );
      }
    } catch (error) {
      if (error.code === "23505") {
        // Duplicate key
        this.logger.error("Cette permission est déjà assignée");
      } else {
        this.logger.error(`Erreur lors de l'assignation: ${error.message}`);
      }
      process.exit(1);
    }
  }
}
