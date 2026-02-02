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
import { BaseCommand } from "@adonisjs/core/build/standalone";

export default class AclListRoles extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:list:roles";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Lister tous les rôles";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");

    try {
      const roles = await Database.from("roles")
        .select("id", "slug", "name", "description")
        .orderBy("name");

      if (roles.length === 0) {
        this.logger.info("Aucun rôle trouvé");
        return;
      }

      this.logger.info(`\nTotal: ${roles.length} rôle(s)\n`);

      // Afficher un tableau
      const headers = ["ID", "Slug", "Nom", "Description"];
      const rows = roles.map((role) => [
        role.id,
        role.slug,
        role.name,
        role.description || "-",
      ]);

      this.ui.table.head(headers);
      rows.forEach((row) => this.ui.table.row(row));
      this.ui.table.render();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des rôles: ${error.message}`
      );
      process.exit(1);
    }
  }
}
