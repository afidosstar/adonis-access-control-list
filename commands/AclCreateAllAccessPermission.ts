import { BaseCommand, flags } from "@adonisjs/core/build/standalone";
//import Access from "../src/Models/Access";
//import Permission from "../src/Models/Permission";
import { snakeCase } from "snake-case";

export default class AclCreateAllAccessPermission extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:create:all-access-permission";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Create/update permission and assigne all access";

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
  @flags.string({ name: "name", description: "Name of the permission" })
  public name: string = "all";

  @flags.string({
    name: "description",
    description: "Describe of the permissions",
  })
  public description: string = "Create/update permission and assign all access";

  public async run() {
    const Access = require("../src/Models/Access").default;
    const Permission = require("../src/Models/Permission").default;
    const permission = await Permission.updateOrCreate(
      { name: "all" },
      {
        name: this.name,
        slug: snakeCase(this.name),
        description: this.description,
      }
    );
    const accesses = await Access.all();
    await permission.related("accesses").sync(accesses.map((row) => row.id));
    return permission;
  }
}
