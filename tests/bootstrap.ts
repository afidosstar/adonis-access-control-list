import { join } from "path";
import { Filesystem } from "@poppinss/dev-utils";
import { Application } from "@adonisjs/core/build/standalone";

export const fs = new Filesystem(join(__dirname, "__app"));

export async function setup() {
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
          filename: '${join(fs.basePath, "db.sqlite")}',
        },
        useNullAsDefault: true,
      },
    }
  `
  );

  await fs.add(
    "config/acl.ts",
    `
    export const joinTables = {
      userRole: 'role_user',
      permissionUser: 'permission_user',
      permissionRole: 'permission_role',
    }
    export const superAdminRole = 'super_admin'
  `
  );

  const app = new Application(fs.basePath, "test", {
    providers: [
      "@adonisjs/core",
      "@adonisjs/lucid",
      "adonis-lucid-soft-deletes",
      join(__dirname, "../providers/AccessControlListProvider"),
    ],
  });

  await app.setup();
  await app.registerProviders();
  await app.bootProviders();

  return app;
}

export async function cleanup() {
  await fs.cleanup();
}
