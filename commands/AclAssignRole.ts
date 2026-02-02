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

export default class AclAssignRole extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:assign:role";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Assigner un rôle à un utilisateur";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @args.string({ description: "Slug du rôle" })
  public roleSlug: string;

  @flags.number({ description: "ID de l'utilisateur" })
  public userId: number;

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");
    const Config = this.application.container.use("Adonis/Core/Config");

    try {
      // Récupérer le rôle
      const role = await Database.from("roles")
        .where("slug", this.roleSlug)
        .first();

      if (!role) {
        this.logger.error(`Rôle "${this.roleSlug}" introuvable`);
        return;
      }

      // Vérifier que l'utilisateur existe
      const user = await Database.from("users")
        .where("id", this.userId)
        .first();

      if (!user) {
        this.logger.error(`Utilisateur #${this.userId} introuvable`);
        return;
      }

      const { userRole } = Config.get("acl.joinTables");
      await Database.table(userRole).insert({
        role_id: role.id,
        user_id: this.userId,
        created_at: new Date(),
        updated_at: new Date(),
      });

      this.logger.success(
        `Rôle "${this.roleSlug}" assigné à l'utilisateur #${this.userId}`
      );
    } catch (error) {
      if (error.code === "23505") {
        // Duplicate key
        this.logger.error("Ce rôle est déjà assigné à cet utilisateur");
      } else {
        this.logger.error(`Erreur lors de l'assignation: ${error.message}`);
      }
      process.exit(1);
    }
  }
}
