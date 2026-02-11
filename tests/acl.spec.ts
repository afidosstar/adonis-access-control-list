import test from "japa";
import { column } from "@adonisjs/lucid/build/src/Orm/Decorators";
import { ApplicationContract } from "@ioc:Adonis/Core/Application";
import { BaseModel } from "@adonisjs/lucid/build/src/Orm/BaseModel";
import Database from "@ioc:Adonis/Lucid/Database";

const app: ApplicationContract = global[Symbol.for("__TEST_APP__")];

test.group("ACL System", (group) => {
  let BaseUser: any;
  let Role: any;
  let Permission: any;

  group.before(async () => {
    await Database.beginGlobalTransaction();
  });

  // Pas de cleanup ici car il est géré globalement dans japaFile.ts
  group.after(async () => {
    await Database.rollbackGlobalTransaction();
  });

  // Résolution lazy après le boot → c'est ici que c'est SAFE
  group.beforeEach(async () => {
    const acl = app.container.use("Adonis/Addons/Acl");
    BaseUser = acl.BaseUser;
    Role = app.container.use("Adonis/Addons/Acl/Models/Role");
    Permission = app.container.use("Adonis/Addons/Acl/Models/Permission");
  });

  group.afterEach(async () => {
    // On utilise delete() sans where pour tout supprimer, mais attention aux contraintes de clé étrangère
    // L'ordre est important ou utiliser truncate si supporté par sqlite (non)
    // Pour sqlite, delete() est ok.
    try {
      await Role.query().delete();
      await Permission.query().delete();
    } catch (e) {
      console.error("Error cleaning up:", e);
    }
  });

  test("it can assign a role to a user", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const role = await Role.create({ name: "Admin", slug: "admin" });

    await user.related("roles").attach([role.id]);

    const hasRole = await user.hasRole("admin");
    assert.isTrue(hasRole);
  });

  test("it can assign a direct permission to a user", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const permission = await Permission.create({
      name: "Create User",
      slug: "users.create",
    });

    await user.related("permissions").attach([permission.id]);

    const canCreate = await user.can("users.create");
    assert.isTrue(canCreate);
  });

  test("user inherits permissions from role", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const role = await Role.create({ name: "Editor", slug: "editor" });
    const permission = await Permission.create({
      name: "Edit Post",
      slug: "posts.edit",
    });

    // Assign permission to role
    await role.related("permissions").attach([permission.id]);

    // Assign role to user
    await user.related("roles").attach([role.id]);

    const canEdit = await user.can("posts.edit");
    assert.isTrue(canEdit);
  });

  test("wildcard permission matches specific action", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const permission = await Permission.create({
      name: "Manage Users",
      slug: "users.*",
    });

    await user.related("permissions").attach([permission.id]);

    assert.isTrue(await user.can("users.create"));
    assert.isTrue(await user.can("users.delete"));
    assert.isFalse(await user.can("posts.create"));
  });

  test("universal wildcard matches everything", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const permission = await Permission.create({
      name: "Super Access",
      slug: "*",
    });

    await user.related("permissions").attach([permission.id]);

    assert.isTrue(await user.can("anything.do"));
  });

  test("hasAnyRole returns true if user has one of the roles", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const role1 = await Role.create({ name: "Editor", slug: "editor" });
    // const role2 = await Role.create({ name: "Viewer", slug: "viewer" });

    await user.related("roles").attach([role1.id]);

    assert.isTrue(await user.hasAnyRole(["editor", "admin"]));
    assert.isFalse(await user.hasAnyRole(["admin", "manager"]));
  });

  test("hasAllRoles returns true only if user has all roles", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const role1 = await Role.create({ name: "Editor", slug: "editor" });
    const role2 = await Role.create({ name: "Viewer", slug: "viewer" });

    await user.related("roles").attach([role1.id, role2.id]);

    assert.isTrue(await user.hasAllRoles(["editor", "viewer"]));
    assert.isFalse(await user.hasAllRoles(["editor", "admin"]));
  });

  test("isSuperAdmin checks for configured super admin role", async (assert) => {
    class User extends BaseUser(BaseModel) {
      @column({ isPrimary: true })
      public declare id: number;
      @column()
      public declare username: string;
    }
    User.boot();

    const user = await User.create({ username: "testuser" });
    const superRole = await Role.create({
      name: "Super Admin",
      slug: "super_admin",
    });

    await user.related("roles").attach([superRole.id]);

    assert.isTrue(await user.isSuperAdmin());
  });
});
