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
  LucidModel,
  ManyToMany,
  ManyToManyDecorator,
} from "@ioc:Adonis/Lucid/Orm";
import { ConfigContract } from "@ioc:Adonis/Core/Config";

export default (
  BaseModel: LucidModel,
  manyToMany: ManyToManyDecorator,
  column,
  Config: ConfigContract,
  Permission: LucidModel
) => {
  const { permissionRole } = Config.get("acl.joinTables");
  class Role extends BaseModel {
    @column({ isPrimary: true })
    public id: number;

    @column() public name: string;

    @column() public slug: string;

    @column() public description: string;

    @manyToMany(() => Permission, {
      pivotTable: permissionRole,
    })
    public permissions: ManyToMany<typeof Permission>;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;
  }
  return Role;
};
