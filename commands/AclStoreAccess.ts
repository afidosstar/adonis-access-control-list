import { BaseCommand, flags } from "@adonisjs/core/build/standalone";
import * as _ from "lodash";
import { AccessRouteContract } from "@ioc:Adonis/Addons/Acl";

export default class AclStoreAccess extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:store:access";

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    "Update permissions in Db based on route with method authorize. Use --list or --json to preview changes.";

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

  @flags.boolean({
    description:
      "Afficher uniquement la liste des permissions sans les sauvegarder",
    alias: "l",
  })
  public declare list: boolean;

  @flags.boolean({
    description:
      "Afficher la liste des permissions au format JSON sans les sauvegarder",
    alias: "j",
  })
  public declare json: boolean;

  @flags.array({
    description:
      "Colonnes à afficher pour le mode liste (slug, name, group, route, description)",
    alias: "c",
  })
  public declare columns: string[];

  public async run() {
    const Router = this.application.container.use("Adonis/Core/Route");
    const Database = this.application.container.use("Adonis/Lucid/Database");

    /**
     * Commit routes before we can read them
     */
    Router.commit();
    const authorizedDescriptors: ({
      route: string;
      slug: string;
    } & AccessRouteContract)[] = _.map(
      _.concat(..._.values(Router.toJSON())).filter(
        ({ meta }) => meta.authorizeRoute
      ),
      ({ methods, pattern, meta }: any) => {
        const { authorizeRoute } = meta;
        return {
          name: authorizeRoute.name,
          slug: authorizeRoute.slug,
          group: authorizeRoute.group,
          route: `${methods.join("|")} ${pattern}`,
          description: `${authorizeRoute.description} du groupe ${
            authorizeRoute.group
          } accept les méthodes (${methods.join(
            "|"
          )}) sur Url sous la forme de ${pattern}`,
        } as { route: string; slug: string } & AccessRouteContract;
      }
    );

    // Vérification des doublons par slug
    _.each(_.groupBy(authorizedDescriptors, "slug"), (row, slug) => {
      if (row.length > 1) {
        this.logger.error(
          ` => fail, all ${row
            .map(({ route }) => route)
            .join(", ")} as same access slug( ${slug} )`
        );
        process.exit(1);
      }
    });

    // Vérification des doublons par name
    _.each(_.groupBy(authorizedDescriptors, "name"), (row, name) => {
      if (row.length > 1) {
        this.logger.error(
          ` => fail, all ${row
            .map(({ route }) => route)
            .join(", ")} as same access name( ${name} )`
        );
        process.exit(1);
      }
    });

    if (this.json) {
      console.log(JSON.stringify(authorizedDescriptors, null, 2));
      return;
    }

    if (this.list) {
      const table = this.ui.table();

      const availableColumns = {
        slug: "Slug",
        name: "Nom",
        group: "Groupe",
        route: "Route",
        description: "Description",
      };

      let columnsToShow =
        this.columns && this.columns.length > 0
          ? this.columns.filter((c) =>
              Object.keys(availableColumns).includes(c)
            )
          : Object.keys(availableColumns);

      if (columnsToShow.length === 0) {
        columnsToShow = Object.keys(availableColumns);
      }

      table.head(columnsToShow.map((c) => availableColumns[c]));

      authorizedDescriptors.forEach((desc) => {
        const rowData = columnsToShow.map((col) => {
          if (col === "group" || col === "description") {
            return desc[col] || "-";
          }
          return desc[col];
        });
        table.row(rowData);
      });

      table.render();
      this.logger.info(
        `\nTotal: ${authorizedDescriptors.length} permission(s) trouvée(s)`
      );
      return;
    }

    await Database.transaction(async (trx) => {
      await trx
        .from("permissions")
        .whereNotIn(
          "slug",
          authorizedDescriptors.map(({ slug }) => slug)
        )
        .delete();
      const permits = await trx
        .table("permissions")
        .knexQuery.insert(authorizedDescriptors)
        .onConflict(["route"])
        .merge()
        .onConflict(["slug"])
        .merge()
        .onConflict(["name"])
        .merge()
        .returning("id");

      const ids = permits.map((p) => p.id);
      await trx.from("permissions").whereNotIn("id", ids).delete();
    })
      .then(() => this.logger.success(`Save permission successfull`))
      .catch((error) => {
        this.logger.error(error);
      })
      .finally(() => {});
  }
}
