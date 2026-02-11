import { join } from "path";
import { existsSync, unlinkSync } from "fs";
import { Filesystem } from "@poppinss/dev-utils";
import { ApplicationContract } from "@ioc:Adonis/Core/Application";
import { Application } from "@adonisjs/core/build/standalone";

const fs = new Filesystem(join(__dirname, "../tests/", "__app"));

export async function setup(app: ApplicationContract) {
  await fs.ensureRoot();
  const Database = app.container.use("Adonis/Lucid/Database");
  const schema = Database.connection().schema;
  console.log("schema", "insert");

  await schema.createTable("users", (table) => {
    table.increments("id");
    table.string("username");
    table.timestamps(true);
  });

  await schema.createTable("roles", (table) => {
    table.increments("id");
    table.string("name");
    table.string("slug").unique();
    table.string("description").nullable();
    table.timestamps(true);
    table.timestamp("deleted_at").nullable();
  });

  await schema.createTable("permissions", (table) => {
    table.increments("id");
    table.string("name");
    table.string("slug").unique();
    table.string("description").nullable();
    table.string("route").nullable();
    table.string("group").nullable();
    table.timestamps(true);
    table.timestamp("deleted_at").nullable();
  });

  await schema.createTable("role_user", (table) => {
    table.increments("id");
    table.integer("user_id").unsigned().references("id").inTable("users");
    table.integer("role_id").unsigned().references("id").inTable("roles");
    table.timestamps(true);
  });

  await schema.createTable("permission_user", (table) => {
    table.increments("id");
    table.integer("user_id").unsigned().references("id").inTable("users");
    table
      .integer("permission_id")
      .unsigned()
      .references("id")
      .inTable("permissions");
    table.timestamps(true);
  });

  schema.createTable("permission_role", (table) => {
    table.increments("id");
    table.integer("role_id").unsigned().references("id").inTable("roles");
    table
      .integer("permission_id")
      .unsigned()
      .references("id")
      .inTable("permissions");
    table.timestamps(true);
  });
}

/**
 * Setup application
 */
export async function setupApplication(): Promise<ApplicationContract> {
  await fs.add(".env", "");
  await fs.add(
    "config/app.ts",
    `
      export const appKey = 'averylong32charsrandomsecretkey'
      export const http = {
        cookie: {},
        trustProxy: () => true,
      }
    `
  );

  if (existsSync(join(fs.basePath, "test.sqlite"))) {
    unlinkSync(join(fs.basePath, "test.sqlite"));
  }

  await fs.add(
    "config/database.ts",
    `
      export const connection = 'sqlite'
      export const connections = {
        sqlite: {
          client: 'sqlite3',
          connection: {
            filename: '${join(fs.basePath, "test.sqlite")}',
          },
          useNullAsDefault: true,
        }
      }
    `
  );

  await fs.add(
    "config/acl.ts",
    `
    const aclConfig = {
      joinTables: {
        userRole: 'role_user',
        permissionUser: 'permission_user',
        permissionRole: 'permission_role',
      },
      superAdminRole: 'super_admin',
    }
    export default aclConfig
  `
  );

  // Créer un .adonisrc.json temporaire
  await fs.add(
    ".adonisrc.json",
    JSON.stringify(
      {
        typescript: true,
        providers: [
          "@adonisjs/core",
          "@adonisjs/lucid",
          "@adonisjs/view",
          "adonis-lucid-soft-deletes",
          "../../providers/AccessControlListProvider",
        ],
        preloads: [],
        metaFiles: [],
        commands: [],
        aliases: {
          App: "app",
        },
      },
      null,
      2
    )
  );

  const app = new Application(fs.basePath, "test", {
    aliases: { App: "./app" },
    providers: [
      "@adonisjs/core",
      "@adonisjs/lucid",
      "@adonisjs/view",
      "adonis-lucid-soft-deletes",
      "../../providers/AccessControlListProvider",
    ],
  });

  await app.setup();
  await app.registerProviders();
  await app.bootProviders();

  console.log(app.container.hasBinding("Adonis/Lucid/Orm")); // true/false
  console.log(app.container.hasBinding("Adonis/Lucid/Database")); // true/false
  console.log(app.container.hasBinding("Adonis/Addons/Acl/Models/Permission")); // true/false
  console.log("application setup");
  return app;
}
