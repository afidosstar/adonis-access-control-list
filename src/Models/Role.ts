/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:56:9
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { compose } from "@poppinss/utils/build/src/Helpers";
import { SoftDeletes } from "@ioc:Adonis/Addons/LucidSoftDeletes";
import Permission from "./Permission";
import Config from "@ioc:Adonis/Core/Config";
const { permissionRole } = Config.get("acl.joinTables");

export default class Role extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number;

  @column() public name: string;

  @column() public slug: string;

  @column() public description: string;

  @manyToMany(() => Permission, {
    pivotTable: permissionRole,
    relatedKey: "id",
    pivotForeignKey: "role_id",
    pivotRelatedForeignKey: "permission_id",
  })
  public permissions: ManyToMany<typeof Permission>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
