import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class PermissionsAccesses extends BaseSchema {
  protected tableName = "{{ tableName }}";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("permission_id")
        .unsigned()
        .references("id")
        .inTable("permissions")
        .onDelete("CASCADE");
      table
        .integer("access_id")
        .unsigned()
        .references("id")
        .inTable("accesses")
        .onDelete("CASCADE");
      table.unique(["permission_id", "access_id"]);
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
