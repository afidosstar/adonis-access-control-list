import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Roles extends BaseSchema {
  protected tableName = "{{ tableName }}";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("slug", 255).notNullable();
      table.string("description").notNullable();
      table.string("name").notNullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
      table.timestamp("deleted_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
