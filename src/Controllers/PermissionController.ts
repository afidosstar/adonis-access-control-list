/*
 *  Copyright (c) 2022.
 *  @created 15/10/2022 - 15:51:27
 *  @project adonis-acl
 *  @author "fiacre.ayedoun@gmail.com"
 *
 *  For the full copyright and license information, please view the LICENSE
 *  file that was distributed with this source code.
 *
 */

import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Permission from "../Models/Permission";
import Database from "@ioc:Adonis/Lucid/Database";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
//import Config from "@ioc:Adonis/Core/Config";

export default class PermissionController {
  //private configs = Config.get("acl");
  public async index({ view }: HttpContextContract) {
    const permissions = await Permission.query();
    return view.render("acl::permissions.index", { data: permissions });
  }
  public async new({ view }: HttpContextContract) {
    return view.render("acl::permissions.new");
  }
  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.unique({ table: "permissions", column: "name" }),
        ]),
        description: schema.string.optional(),
        slug: schema.string(),
      }),
    });
    const result = await Database.transaction(async (trx) => {
      const permission = await Permission.create(data, { client: trx });
      await permission.$getRelated("accesses");
      return permission;
    });
    return response
      .redirect()
      .toRoute("acl.permissions.show", { id: result.id });
  }

  public async show({ view, params, response }: HttpContextContract) {
    const permission = await Permission.find(params.id);
    if (!permission) {
      return response.notFound();
    }
    await permission.$getRelated("accesses");
    return view.render("acl::permissions.update", { data: permission });
  }

  public async update({ request, response, params }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.unique({
            table: "permissions",
            column: "name",
            whereNot: { id: params.id },
          }),
        ]),
        description: schema.string.optional(),
        slug: schema.string(),
      }),
    });
    const result = await Database.transaction(async (trx) => {
      const permission = await Permission.find(params.id, { client: trx });
      if (!permission) {
        return null;
      }
      permission.merge(data);
      await permission.save();
      return permission;
    });
    if (!result) {
      return response.notFound();
    }
    return response
      .redirect()
      .toRoute("acl.permissions.show", { id: result.id });
  }

  public async destroy({ response, params }: HttpContextContract) {
    const permission = await Permission.find(params.id);
    if (!permission) {
      return response.notFound();
    }
    await permission.delete();
    return response.redirect().toRoute("acl.permissions.index");
  }

  public async sync({ request, response, params }: HttpContextContract) {
    const permission = await Permission.find(params.id);
    if (!permission) {
      return response.notFound();
    }
    const bulks = request.input("bulks", []);
    await permission.related("accesses").sync(bulks);
    return response
      .redirect()
      .toRoute("acl.permissions.show", { id: permission.id });
  }
}
