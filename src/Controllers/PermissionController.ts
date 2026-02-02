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
import Database from "@ioc:Adonis/Lucid/Database";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Permission from "@ioc:Adonis/Addons/Acl/Models/Permission";

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
        name: schema.string({ trim: true }),
        description: schema.string.optional(),
        slug: schema.string(),
        route: schema.string.optional(),
        group: schema.string.optional(),
      }),
    });

    const result = await Database.transaction(async (trx) => {
      // Vérifier si une permission soft-deleted existe déjà avec ce slug ou name
      const existingPermission = await Permission.query({ client: trx })
        .withTrashed()
        .where((query) => {
          query.where("slug", data.slug).orWhere("name", data.name);
        })
        .first();

      if (existingPermission) {
        if (existingPermission.deletedAt) {
          // Restaurer et mettre à jour
          await existingPermission.restore();
          existingPermission.merge(data);
          await existingPermission.save();
          return existingPermission;
        } else {
          // Existe déjà et n'est pas supprimé
          throw new Error("Une permission avec ce slug ou nom existe déjà");
        }
      }

      // Créer une nouvelle permission
      const permission = await Permission.create(data, { client: trx });
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
        route: schema.string.optional(),
        group: schema.string.optional(),
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
    await permission.delete(); // Soft delete automatique grâce au package
    return response.redirect().toRoute("acl.permissions.index");
  }

  /**
   * Affiche les permissions supprimées (soft deleted)
   */
  public async trashed({ view }: HttpContextContract) {
    const permissions = await Permission.query().onlyTrashed();
    return view.render("acl::permissions.trashed", { data: permissions });
  }

  /**
   * Restaure une permission supprimée
   */
  public async restore({ response, params }: HttpContextContract) {
    const permission = await Permission.query()
      .withTrashed()
      .where("id", params.id)
      .first();

    if (!permission) {
      return response.notFound();
    }

    await permission.restore();
    return response
      .redirect()
      .toRoute("acl.permissions.show", { id: permission.id });
  }

  /**
   * Supprime définitivement une permission
   */
  public async forceDelete({ response, params }: HttpContextContract) {
    const permission = await Permission.query()
      .withTrashed()
      .where("id", params.id)
      .first();

    if (!permission) {
      return response.notFound();
    }

    await permission.forceDelete();
    return response.redirect().toRoute("acl.permissions.index");
  }
}
