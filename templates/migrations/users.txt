import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class UsersSchema extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("full_name", 255).notNullable().unique();
      table.string("email", 255).notNullable().unique();
      table.string("password", 180).notNullable();
      table.string("service", 255).notNullable();
      table.string("job", 255).notNullable();
      table.string("role", 255).defaultTo("");
      table.integer("created_by", 255);
      table.integer("updated_by", 255);
      table.boolean("change_password").defaultTo("false");
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
