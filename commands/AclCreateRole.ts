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

export default class AclCreateRole extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:create:role";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Créer un nouveau rôle";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  @args.string({ description: "Slug du rôle (ex: admin, user)" })
  public slug: string;

  @args.string({ description: "Nom du rôle (ex: Administrator)" })
  public name: string;

  @flags.string({ description: "Description du rôle" })
  public description: string | null;

  public async run() {
    const Database = this.application.container.use("Adonis/Lucid/Database");

    try {
      await Database.transaction(async (trx) => {
        // Vérifier si un rôle soft-deleted existe
        const existing = await trx
          .from("roles")
          .where((query) => {
            query.where("slug", this.slug).orWhere("name", this.name);
          })
          .first();

        if (existing) {
          if (existing.deleted_at) {
            // Restaurer le rôle
            await trx.from("roles").where("id", existing.id).update({
              slug: this.slug,
              name: this.name,
              description: this.description,
              deleted_at: null,
              updated_at: new Date(),
            });

            this.logger.success(
              `Rôle "${this.name}" (${this.slug}) restauré et mis à jour avec succès`
            );
          } else {
            this.logger.error(`Le rôle "${this.slug}" existe déjà`);
            process.exit(1);
          }
        } else {
          // Créer un nouveau rôle
          await trx.table("roles").insert({
            slug: this.slug,
            name: this.name,
            description: this.description,
            created_at: new Date(),
            updated_at: new Date(),
          });

          this.logger.success(
            `Rôle "${this.name}" (${this.slug}) créé avec succès`
          );
        }
      });
    } catch (error) {
      this.logger.error(`Erreur lors de la création du rôle: ${error.message}`);
      process.exit(1);
    }
  }
}
