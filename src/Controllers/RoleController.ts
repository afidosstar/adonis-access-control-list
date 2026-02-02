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
import Role from "@ioc:Adonis/Addons/Acl/Models/Role";

export default class RoleController {
  public async index({ view }: HttpContextContract) {
    const roles = await Role.query();
    return view.render("acl::roles.index", { data: roles });
  }

  public async new({ view }: HttpContextContract) {
    return view.render("acl::roles.new");
  }

  public async store({ request, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }),
        slug: schema.string({ trim: true }),
        description: schema.string.optional(),
      }),
    });

    const result = await Database.transaction(async (trx) => {
      // Vérifier si un rôle soft-deleted existe déjà avec ce slug ou name
      const existingRole = await Role.query({ client: trx })
        .withTrashed()
        .where((query) => {
          query.where("slug", data.slug).orWhere("name", data.name);
        })
        .first();

      if (existingRole) {
        if (existingRole.deletedAt) {
          // Restaurer et mettre à jour
          await existingRole.restore();
          existingRole.merge(data);
          await existingRole.save();
          return existingRole;
        } else {
          // Existe déjà et n'est pas supprimé
          throw new Error("Un rôle avec ce slug ou nom existe déjà");
        }
      }

      // Créer un nouveau rôle
      const role = await Role.create(data, { client: trx });
      return role;
    });

    return response.redirect().toRoute("acl.roles.show", { id: result.id });
  }

  public async show({ view, params, response }: HttpContextContract) {
    const role = await Role.find(params.id);
    if (!role) {
      return response.notFound();
    }
    await role.load("permissions");
    return view.render("acl::roles.update", { data: role });
  }

  public async update({ request, response, params }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.unique({
            table: "roles",
            column: "name",
            whereNot: { id: params.id },
          }),
        ]),
        slug: schema.string({ trim: true }, [
          rules.unique({
            table: "roles",
            column: "slug",
            whereNot: { id: params.id },
          }),
        ]),
        description: schema.string.optional(),
      }),
    });

    const result = await Database.transaction(async (trx) => {
      const role = await Role.find(params.id, { client: trx });
      if (!role) {
        return null;
      }
      role.merge(data);
      await role.save();
      return role;
    });

    if (!result) {
      return response.notFound();
    }

    return response.redirect().toRoute("acl.roles.show", { id: result.id });
  }

  public async destroy({ response, params }: HttpContextContract) {
    const role = await Role.find(params.id);
    if (!role) {
      return response.notFound();
    }
    await role.delete(); // Soft delete automatique grâce au package
    return response.redirect().toRoute("acl.roles.index");
  }

  /**
   * Affiche les rôles supprimés (soft deleted)
   */
  public async trashed({ view }: HttpContextContract) {
    const roles = await Role.query().onlyTrashed();
    return view.render("acl::roles.trashed", { data: roles });
  }

  /**
   * Restaure un rôle supprimé
   */
  public async restore({ response, params }: HttpContextContract) {
    const role = await Role.query()
      .withTrashed()
      .where("id", params.id)
      .first();

    if (!role) {
      return response.notFound();
    }

    await role.restore();
    return response.redirect().toRoute("acl.roles.show", { id: role.id });
  }

  /**
   * Supprime définitivement un rôle
   */
  public async forceDelete({ response, params }: HttpContextContract) {
    const role = await Role.query()
      .withTrashed()
      .where("id", params.id)
      .first();

    if (!role) {
      return response.notFound();
    }

    await role.forceDelete();
    return response.redirect().toRoute("acl.roles.index");
  }

  /**
   * Assigne des permissions à un rôle
   */
  public async assignPermissions({
    request,
    response,
    params,
  }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        permission_ids: schema.array().members(schema.number()),
      }),
    });

    const role = await Role.find(params.id);
    if (!role) {
      return response.notFound();
    }

    await role.related("permissions").sync(data.permission_ids);
    return response.redirect().toRoute("acl.roles.show", { id: role.id });
  }
}
