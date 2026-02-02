import { BaseCommand } from "@adonisjs/core/build/standalone";
import { join } from "path";
import { fsReadAll } from "@poppinss/utils/build/src/Helpers";

export default class AclSetup extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:setup";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "setup for acl";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {
    if (await this.checkIfIsAlreadySetup()) {
      this.logger.info("already setup");
      return false;
    }

    const joinTables = this.application.container
      .use("Adonis/Core/Config")
      .get("acl.joinTables", {});

    const tasksManager = this.ui.tasks();
    tasksManager.add("Make migration", async (_logger, task) => {
      const index = Date.now();
      this.addMigration("roles", index)
        .addMigration("permissions", index + 1)
        .addMigration("permissions_roles", index + 2, joinTables.permissionRole)
        .addMigration("permissions_users", index + 3, joinTables.permissionUser)
        .addMigration("users_roles", index + 4, joinTables.userRole);
      await this.generator.run();
      await task.complete();
    });
    await tasksManager.run();
  }

  private async checkIfIsAlreadySetup(): Promise<boolean> {
    const data = fsReadAll(
      join(this.application.appRoot, "database/migrations")
    );
    return data.some((val) => /permissions/.test(val));
  }

  private addMigration(name: string, index: number, tableName?: string): this {
    this.generator
      .addFile(`${index}_${name}`, {
        pattern: "snakecase",
      })
      .appRoot(this.application.appRoot)
      .destinationDir("database/migrations")
      .useMustache()
      .stub(join(__dirname, `../templates/migrations/${name}.txt`))
      .apply({ tableName: tableName || name });
    return this;
  }
}
