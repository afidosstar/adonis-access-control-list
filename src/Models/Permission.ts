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
} from "@ioc:Adonis/Lucid/Orm";
import { compose } from "@poppinss/utils/build/src/Helpers";
import { SoftDeletes } from "adonis-lucid-soft-deletes";

export default class Permission extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  public id: number;

  @column() public name: string;

  @column() public slug: string;

  @column() public description: string;

  @column() public route: string;

  @column() public group: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoUpdate: true })
  public updatedAt: DateTime;

  @column.dateTime()
  public deletedAt?: DateTime;
}
