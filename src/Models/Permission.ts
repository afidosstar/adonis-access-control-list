/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:55:59
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
  manyToMany,
  ManyToMany,
} from "@ioc:Adonis/Lucid/Orm";
//import Access from "./Access";
import Config from "@ioc:Adonis/Core/Config";
import Access from "@ioc:Adonis/Addons/Acl/Models/Access";
const { permissionAccess } = Config.get("acl.joinTables");

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column() public name: string;

  @column() public slug: string;

  @column() public description: string;

  @manyToMany(() => Access, {
    pivotTable: permissionAccess,
    pivotForeignKey: "permission_id",
    pivotRelatedForeignKey: "access_id",
  })
  public accesses: ManyToMany<typeof Access>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoUpdate: true })
  public updatedAt: DateTime;
}
