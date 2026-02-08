import test from "japa";
import { setup, cleanup } from "./bootstrap";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import { BaseUser } from "../src/Models/BaseUser";
import Role from "../src/Models/Role";
import Permission from "../src/Models/Permission";
import { ApplicationContract } from "@ioc:Adonis/Core/Application";

// --- Define a concrete User model for testing ---
class User extends BaseUser(BaseModel) {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public username: string;
}

// --- Helper to setup database schema ---
async function setupSchema(app: ApplicationContract) {
  const db = app.container.use("Adonis/Lucid/Database");
  const schema = db.schema;

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

test.group("ACL System", (group) => {
  let app: ApplicationContract;

  group.before(async () => {
    app = await setup();
    await setupSchema(app);
  });

  group.after(async () => {
    await cleanup();
  });

  group.afterEach(async () => {
    // Clean up data after each test
    await User.query().delete();
    await Role.query().delete();
    await Permission.query().delete();
  });

  test("it can assign a role to a user", async (assert) => {
    const user = await User.create({ username: "testuser" });
    const role = await Role.create({ name: "Admin", slug: "admin" });

    await user.related("roles").attach([role.id]);

    const hasRole = await user.hasRole("admin");
    assert.isTrue(hasRole);
  });

  test("it can assign a direct permission to a user", async (assert) => {
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
    const user = await User.create({ username: "testuser" });
    const permission = await Permission.create({
      name: "Super Access",
      slug: "*",
    });

    await user.related("permissions").attach([permission.id]);

    assert.isTrue(await user.can("anything.do"));
  });

  test("hasAnyRole returns true if user has one of the roles", async (assert) => {
    const user = await User.create({ username: "testuser" });
    const role1 = await Role.create({ name: "Editor", slug: "editor" });
    const role2 = await Role.create({ name: "Viewer", slug: "viewer" });

    await user.related("roles").attach([role1.id]);

    assert.isTrue(await user.hasAnyRole(["editor", "admin"]));
    assert.isFalse(await user.hasAnyRole(["admin", "manager"]));
  });

  test("hasAllRoles returns true only if user has all roles", async (assert) => {
    const user = await User.create({ username: "testuser" });
    const role1 = await Role.create({ name: "Editor", slug: "editor" });
    const role2 = await Role.create({ name: "Viewer", slug: "viewer" });

    await user.related("roles").attach([role1.id, role2.id]);

    assert.isTrue(await user.hasAllRoles(["editor", "viewer"]));
    assert.isFalse(await user.hasAllRoles(["editor", "admin"]));
  });

  test("isSuperAdmin checks for configured super admin role", async (assert) => {
    const user = await User.create({ username: "testuser" });
    const superRole = await Role.create({
      name: "Super Admin",
      slug: "super_admin",
    });

    await user.related("roles").attach([superRole.id]);

    assert.isTrue(await user.isSuperAdmin());
  });
});
