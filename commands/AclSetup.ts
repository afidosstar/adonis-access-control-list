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

    const tasksManager = this.ui.tasks();
    tasksManager.add("Make migration", async (_logger, task) => {
      this.addMigration("accesses")
        .addMigration("roles")
        .addMigration("permissions")
        .addMigration("permissions_accesses")
        .addMigration("permissions_roles")
        .addMigration("permissions_users")
        .addMigration("users_roles");
      await this.generator.run();
      await task.complete();
    });
  }

  private async checkIfIsAlreadySetup(): Promise<boolean> {
    const data = fsReadAll(
      join(this.application.appRoot, "database/migrations")
    );
    return data.some((val) => /accesses/.test(val));
  }

  private addMigration(name: string): this {
    this.generator
      .addFile(`${Date.now()}_${name}`, {
        pattern: "snakecase",
      })
      .appRoot(this.application.appRoot)
      .destinationDir("database/migrations")
      .useMustache()
      .stub(join(__dirname, `../templates/migrations/${name}.txt`))
      .apply({ name });
    return this;
  }
}
