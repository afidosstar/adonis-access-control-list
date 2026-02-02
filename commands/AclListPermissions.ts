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
import { BaseCommand, flags } from "@adonisjs/core/build/standalone";

export default class AclListPermissions extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:list:permissions";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Lister toutes les permissions";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @flags.string({ description: "Filtrer par groupe" })
  public group: string | null;

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");

    try {
      let query = Database.from("permissions")
        .select("id", "slug", "name", "group", "route", "description")
        .orderBy("group")
        .orderBy("name");

      if (this.group) {
        query = query.where("group", this.group);
      }

      const permissions = await query;

      if (permissions.length === 0) {
        this.logger.info("Aucune permission trouvée");
        return;
      }

      this.logger.info(`\nTotal: ${permissions.length} permission(s)\n`);

      // Afficher un tableau
      const headers = ["ID", "Slug", "Nom", "Groupe", "Route"];
      const rows = permissions.map((perm) => [
        perm.id,
        perm.slug,
        perm.name,
        perm.group || "-",
        perm.route || "-",
      ]);

      this.ui.table.head(headers);
      rows.forEach((row) => this.ui.table.row(row));
      this.ui.table.render();
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération des permissions: ${error.message}`
      );
      process.exit(1);
    }
  }
}
