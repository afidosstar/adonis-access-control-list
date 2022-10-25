import { BaseCommand } from "@adonisjs/core/build/standalone";
import * as _ from "lodash";
import { AccessRouteContract } from "@ioc:Adonis/Addons/Acl";
import { snakeCase } from "snake-case";

export default class AclStoreAccess extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "acl:store:access";

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    "Update access in Db, based on route with method authorize";

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
          slug: snakeCase(authorizeRoute.name),
          description: authorizeRoute.description,
          group: authorizeRoute.group,
          route: `${methods.join("|")} ${pattern}`,
        } as { route: string; slug: string } & AccessRouteContract;
      }
    );
    _.each(_.groupBy(authorizedDescriptors, "slug"), (row, slug) => {
      if (row.length > 1) {
        this.logger.error(
          ` => fail, all ${row
            .map(({ endpoint }) => endpoint)
            .join(", ")} as same access slug( ${slug} )`
        );
        process.exit(1);
      }
    });
    await Database.transaction(async (trx) => {
      const permits = await trx
        .table("accesses")
        .knexQuery.insert(authorizedDescriptors)
        .onConflict(["route", "slug", "name"])
        .merge()
        .returning("id");

      // const permits = await Promise.all(
      //   authorizedDescriptors.map((access) => {
      //     return Access.query({ client: trx })
      //       .where(_.pick(access, "endpoint"))
      //       .orWhere(_.pick(access, "code"))
      //       .first()
      //       .then((data) => {
      //         if (data) {
      //           data.merge(access);
      //           return data
      //             .useTransaction(trx)
      //             .save()
      //             .then(() => data);
      //         }
      //         return Access.create(access, { client: trx });
      //       });
      //   })
      // );

      const ids = permits.map((p) => p.id);
      await trx.from("accesses").whereNotIn("id", ids).delete();
      // await Access.query({ client: trx }).where("id", "NOT IN", ids).delete();
    })
      .then(() => this.logger.success(`Save permission successfull`))
      .catch((error) => {
        this.logger.error(error);
      })
      .finally(() => {});
  }
}
