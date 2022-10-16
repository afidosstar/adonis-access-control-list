/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 16:55:31
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */
import { DateTime } from "luxon";
import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Access extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column() public name: string;

  @column() public group: string;

  @column() public route: string;

  @column() public slug: string;

  @column() public description?: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
