import { join } from "path";
import knex from "knex";
import { Filesystem } from "@poppinss/dev-utils";
import { ApplicationContract } from "@ioc:Adonis/Core/Application";
import { Application } from "@adonisjs/core/build/standalone";
import { BaseModel } from "@adonisjs/lucid/build/src/Orm/BaseModel";
import { Adapter } from "@adonisjs/lucid/build/src/Orm/Adapter";
import { Database } from "@adonisjs/lucid/build/src/Database";
import { SqliteConfig } from "@ioc:Adonis/Lucid/Database";
import { LucidModel } from "@ioc:Adonis/Lucid/Orm";

const fs = new Filesystem(join(__dirname, "tmp"));

export const dbConfig: SqliteConfig = {
  client: "sqlite3",
  connection: { filename: ":memory:" },
  debug: false,
  useNullAsDefault: true,
};

export async function setup(destroyDb: boolean = true) {
  await fs.ensureRoot();
  const db = knex(dbConfig);
  const schema = db.schema;

  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await schema.createTable("users", (table) => {
      table.increments("id");
      table.string("username");
      table.timestamps(true);
    });
  }

  const hasRoles = await db.schema.hasTable("roles");
  if (!hasRoles) {
    await schema.createTable("roles", (table) => {
      table.increments("id");
      table.string("name");
      table.string("slug").unique();
      table.string("description").nullable();
      table.timestamps(true);
      table.timestamp("deleted_at").nullable();
    });
  }

  const hasPermissions = await db.schema.hasTable("permissions");
  if (!hasPermissions) {
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
  }

  const hasRoleUser = await db.schema.hasTable("role_user");
  if (!hasRoleUser) {
    await schema.createTable("role_user", (table) => {
      table.increments("id");
      table.integer("user_id").unsigned().references("id").inTable("users");
      table.integer("role_id").unsigned().references("id").inTable("roles");
      table.timestamps(true);
    });
  }

  const hasPermissionUser = await db.schema.hasTable("permission_user");
  if (!hasPermissionUser) {
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
  }

  const hasPermissionRole = await db.schema.hasTable("permission_role");
  if (!hasPermissionRole) {
    await schema.createTable("permission_role", (table) => {
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

  if (destroyDb) {
    await db.destroy();
  }
}

export async function cleanup() {
  const db = knex(dbConfig);

  await db.schema.dropTableIfExists("users");
  await db.schema.dropTableIfExists("roles");
  await db.schema.dropTableIfExists("permissions");
  await db.schema.dropTableIfExists("role_user");
  await db.schema.dropTableIfExists("permission_user");
  await db.schema.dropTableIfExists("permission_role");

  await db.destroy();
  await fs.cleanup();
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

  await fs.add(
    "config/database.ts",
    `
      export const connection = 'sqlite'
      export const connections = {
        sqlite: {
          client: 'sqlite3',
          connection: {
            filename: ':memory:',
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

  return app;
}

/**
 * Get BaseModel of application
 */
export function getBaseModel(app: ApplicationContract) {
  BaseModel.$container = app.container;
  BaseModel.$adapter = new Adapter(
    new Database(
      {
        connection: "sqlite",
        connections: { sqlite: dbConfig as SqliteConfig },
      },
      app.container.use("Adonis/Core/Logger"),
      app.container.use("Adonis/Core/Profiler"),
      app.container.use("Adonis/Core/Event")
    )
  );

  return BaseModel as unknown as LucidModel;
}
