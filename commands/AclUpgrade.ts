import { BaseCommand } from "@adonisjs/core/build/standalone";
import { join } from "path";
import { fsReadAll } from "@poppinss/utils/build/src/Helpers";

export default class AclUpgrade extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:upgrade";

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    "Génère les migrations d'ajustement du schéma ACL pour les projets déjà installés";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  /**
   * Migrations d'ajustement disponibles, dans l'ordre d'application
   */
  private static upgrades = ["alter_permissions_route_nullable"];

  public async run() {
    const pending = (await this.getPendingUpgrades()).map((name, index) => ({
      name,
      index,
    }));

    if (!pending.length) {
      this.logger.info("Le schéma ACL est déjà à jour");
      return;
    }

    const tasksManager = this.ui.tasks();
    tasksManager.add("Make migration", async (_logger, task) => {
      const timestamp = Date.now();
      pending.forEach(({ name, index }) =>
        this.addMigration(name, timestamp + index)
      );
      await this.generator.run();
      await task.complete();
    });
    await tasksManager.run();

    this.logger.info("Exécuter `node ace migration:run` pour appliquer");
  }

  /**
   * Ne retourne que les migrations d'ajustement absentes du projet
   */
  private async getPendingUpgrades(): Promise<string[]> {
    const files = fsReadAll(
      join(this.application.appRoot, "database/migrations")
    );
    return AclUpgrade.upgrades.filter(
      (name) => !files.some((file) => file.includes(name))
    );
  }

  private addMigration(name: string, index: number): this {
    this.generator
      .addFile(`${index}_${name}`, {
        pattern: "snakecase",
      })
      .appRoot(this.application.appRoot)
      .destinationDir("database/migrations")
      .useMustache()
      .stub(join(__dirname, `../templates/migrations/${name}.txt`))
      .apply({ tableName: "permissions" });
    return this;
  }
}
