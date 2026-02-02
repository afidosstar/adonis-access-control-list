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

export default class AclCreatePermission extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:create:permission";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Créer une nouvelle permission";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @args.string({ description: "Slug de la permission (ex: users.create)" })
  public slug: string;

  @args.string({ description: "Nom de la permission (ex: Create User)" })
  public name: string;

  @flags.string({ description: "Description de la permission" })
  public description: string | null;

  @flags.string({ description: "Route associée (ex: POST /users)" })
  public route: string | null;

  @flags.string({ description: "Groupe de la permission (ex: users)" })
  public group: string | null;

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");

    try {
      await Database.transaction(async (trx) => {
        // Vérifier si une permission soft-deleted existe
        const existing = await trx
          .from("permissions")
          .where((query) => {
            query.where("slug", this.slug).orWhere("name", this.name);
          })
          .first();

        if (existing) {
          if (existing.deleted_at) {
            // Restaurer la permission
            await trx.from("permissions").where("id", existing.id).update({
              slug: this.slug,
              name: this.name,
              description: this.description,
              route: this.route,
              group: this.group,
              deleted_at: null,
              updated_at: new Date(),
            });

            this.logger.success(
              `Permission "${this.name}" (${this.slug}) restaurée et mise à jour avec succès`
            );
          } else {
            this.logger.error(`La permission "${this.slug}" existe déjà`);
            process.exit(1);
          }
        } else {
          // Créer une nouvelle permission
          await trx.table("permissions").insert({
            slug: this.slug,
            name: this.name,
            description: this.description,
            route: this.route,
            group: this.group,
            created_at: new Date(),
            updated_at: new Date(),
          });

          this.logger.success(
            `Permission "${this.name}" (${this.slug}) créée avec succès`
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la permission: ${error.message}`
      );
      process.exit(1);
    }
  }
}
