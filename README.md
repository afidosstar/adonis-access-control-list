# adonis-access-control-list
> Add Access Control List (ACL) for Adonis JS 5+

[![typescript-image]][typescript-url]
[![npm-image]][npm-url]
[![license-image]][license-url]
[![my-coffee-image]][my-coffee-url]


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Models Setup](#models-setup)
- [Working With Roles](#working-with-roles)
- [Working With Permissions](#working-with-permissions)
- [User Helper Methods](#user-helper-methods)
- [Wildcard Permissions](#wildcard-permissions)
- [Super Admin Role](#super-admin-role)
- [Soft Delete Support](#soft-delete-support)
- [CLI Commands](#cli-commands)
- [Protect Routes](#protect-routes)


<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

## 1. Install Package
```bash
npm i --save @fickou/adonis-access-control-list
```

## 2. Install Soft Delete Dependency
```bash
npm i --save adonis-lucid-soft-deletes
```

## 3. Configure Provider
```bash
node ace configure @fickou/adonis-access-control-list
```

## 4. Setup Migrations
```bash
node ace acl:setup
```

## 5. Run Migrations
```bash
node ace migration:run
```

# Configuration

Allez dans `config/acl.ts` pour personnaliser votre configuration :

```ts
import { ConfigAclContract } from "@ioc:Adonis/Addons/Acl";

const configAcl: ConfigAclContract = {
    /**
     * Préfixe pour les routes ACL de gestion
     */
    prefix: "acl",

    /**
     * Middlewares appliqués aux routes de gestion
     * undefined = pas de middleware (à configurer par l'utilisateur)
     */
    middlewares: undefined,

    /**
     * Noms des tables de jointure
     */
    joinTables: {
        permissionRole: "permission_role",
        permissionUser: "permission_user",
        userRole: "user_role",
    },

    /**
     * Mode API uniquement (pas de routes web de gestion)
     * Recommandé: true pour les applications API pures
     */
    apiOnly: true,

    /**
     * Slug du rôle super admin qui bypass toutes les permissions
     */
    superAdminRole: "super_admin",
};

export default configAcl;
```

# Models Setup

## 1. Enregistrer le Middleware

Dans `start/kernel.ts` :

```ts
Server.middleware.register([
    () => import('@ioc:Adonis/Core/BodyParser'),
    () => import('App/Middleware/Auth'),
    () => import('@ioc:Adonis/Addons/Acl/Authorize'), // ✅ Ajoutez cette ligne
])
```

## 2. Configurer le Modèle User

Dans `app/Models/User.ts`, composez votre modèle avec `BaseUser` :

```ts
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@poppinss/utils/build/src/Helpers'
import BaseUser from '@ioc:Adonis/Addons/Acl/BaseUser'

export default class User extends compose(BaseModel, BaseUser) {
    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column({ serializeAs: null })
    public password: string
}
```

# Working With Roles

## Créer un Rôle

### Via le modèle
```ts
import Role from '@ioc:Adonis/Addons/Acl/Models/Role'

const roleAdmin = new Role()
roleAdmin.name = 'Administrator'
roleAdmin.slug = 'admin'
roleAdmin.description = 'Gestion des privilèges administrateur'
await roleAdmin.save()
```

### Via CLI
```bash
node ace acl:create:role admin Administrator --description="Administrateur système"
```

## Assigner un Rôle à un Utilisateur

### Via les relations
```ts
const user = await User.find(1)
await user.related('roles').attach([roleAdmin.id])
```

### Via CLI
```bash
node ace acl:assign:role admin 1
```

## Retirer un Rôle

```ts
const user = await User.find(1)
await user.related('roles').detach([roleAdmin.id])
```

## Lister les Rôles

```bash
node ace acl:list:roles
```

## Récupérer les Rôles d'un Utilisateur

```ts
const user = await User.find(1)
const roles = await user.getRoles() // ['admin', 'moderator']
```

# Working With Permissions

## Créer une Permission

### Via le modèle
```ts
import Permission from '@ioc:Adonis/Addons/Acl/Models/Permission'

const createUsersPermission = new Permission()
createUsersPermission.slug = 'users.create'
createUsersPermission.name = 'Create Users'
createUsersPermission.description = 'Créer des utilisateurs'
createUsersPermission.group = 'users'
createUsersPermission.route = 'POST /users'
await createUsersPermission.save()
```

### Via CLI
```bash
node ace acl:create:permission users.create "Create Users" \
  --description="Créer des utilisateurs" \
  --group="users" \
  --route="POST /users"
```

### Synchroniser depuis les Routes
```bash
node ace acl:store:access
```
Cette commande scanne toutes vos routes avec `.access()` et crée/met à jour automatiquement les permissions.

## Assigner des Permissions à un Rôle

### Via les relations
```ts
const roleAdmin = await Role.find(1)
await roleAdmin.related('permissions').attach([permission.id])
```

### Via CLI
```bash
node ace acl:assign:permission users.create --role=admin
```

## Assigner des Permissions à un Utilisateur

### Via les relations
```ts
const user = await User.find(1)
await user.related('permissions').attach([permission.id])
```

### Via CLI
```bash
node ace acl:assign:permission users.create --user=1
```

## Lister les Permissions

```bash
# Toutes les permissions
node ace acl:list:permissions

# Filtrer par groupe
node ace acl:list:permissions --group=users
```

## Récupérer les Permissions d'un Utilisateur

```ts
const user = await User.find(1)
const permissions = await user.getAccesses()
// ['users.create', 'users.update', 'users.delete', 'posts.*']
```
# User Helper Methods

Le mixin `BaseUser` ajoute plusieurs méthodes utiles à votre modèle User :

```ts
const user = await User.find(1)

// Vérifier un rôle
await user.hasRole('admin') // true/false

// Vérifier plusieurs rôles (au moins un)
await user.hasAnyRole(['admin', 'moderator']) // true si l'un des rôles

// Vérifier plusieurs rôles (tous requis)
await user.hasAllRoles(['admin', 'moderator']) // true si tous les rôles

// Vérifier une permission
await user.hasPermission('users.create') // true/false

// Vérifier plusieurs permissions (au moins une)
await user.hasAnyPermission(['users.create', 'users.update'])

// Vérifier plusieurs permissions (toutes requises)
await user.hasAllPermissions(['users.create', 'users.update'])

// Vérifier si super admin
await user.isSuperAdmin() // true/false

// Vérifier une permission (alias)
await user.can('users.create') // true/false

// Charger les permissions en cache
await user.loadPermissions()
```

# Wildcard Permissions

Les permissions supportent les patterns wildcard :

```ts
// Permission wildcard
const permission = new Permission()
permission.slug = 'users.*'
permission.name = 'All User Permissions'
await permission.save()

// Assigner à un rôle
const role = await Role.findBy('slug', 'admin')
await role.related('permissions').attach([permission.id])

// Maintenant l'utilisateur avec ce rôle a accès à :
// ✅ users.create
// ✅ users.update
// ✅ users.delete
// ✅ users.show
// ❌ posts.create (différent préfixe)

// Permission super wildcard
permission.slug = '*' // Accès à TOUT
```

## Exemples de patterns :
- `*` → Toutes les permissions
- `users.*` → Toutes les permissions users (users.create, users.update, etc.)
- `posts.*` → Toutes les permissions posts
- `users.create` → Permission exacte uniquement

# Super Admin Role

Le rôle configuré comme `superAdminRole` dans la config bypass automatiquement toutes les vérifications de permissions.

```ts
// config/acl.ts
superAdminRole: "super_admin"
```

```ts
// Créer le rôle super admin
const superAdmin = new Role()
superAdmin.slug = 'super_admin'
superAdmin.name = 'Super Administrator'
await superAdmin.save()

// Assigner à un utilisateur
const user = await User.find(1)
await user.related('roles').attach([superAdmin.id])

// Cet utilisateur a maintenant accès à TOUT
// sans avoir besoin d'assigner de permissions
```

# Soft Delete Support

Les rôles et permissions utilisent le soft delete. Les enregistrements supprimés restent en base avec `deleted_at` non null.

## Comportement automatique

Si vous essayez de créer un rôle/permission qui existe déjà en soft-deleted :
- ✅ L'ancien enregistrement est **automatiquement restauré et mis à jour**
- ❌ Pas d'erreur de clé dupliquée

```ts
// 1. Créer une permission
const perm = await Permission.create({ slug: 'users.create', name: 'Create' })

// 2. La supprimer (soft delete)
await perm.delete()

// 3. La recréer → Restauration automatique !
const newPerm = await Permission.create({ slug: 'users.create', name: 'Create Users' })
// newPerm.id === perm.id (même enregistrement restauré)
```

## Gestion manuelle

```ts
// Afficher seulement les éléments supprimés
const trashedPermissions = await Permission.query().onlyTrashed()

// Restaurer
const permission = await Permission.query()
  .withTrashed()
  .where('id', 1)
  .first()
await permission.restore()

// Supprimer définitivement
await permission.forceDelete()
```

# CLI Commands

## Gestion des Rôles

```bash
# Créer un rôle
node ace acl:create:role <slug> <name> [--description]

# Exemples
node ace acl:create:role admin Administrator
node ace acl:create:role moderator Moderator --description="Modération du contenu"

# Lister tous les rôles
node ace acl:list:roles

# Assigner un rôle à un utilisateur
node ace acl:assign:role <role-slug> <user-id>
node ace acl:assign:role admin 1
```

## Gestion des Permissions

```bash
# Créer une permission
node ace acl:create:permission <slug> <name> [options]

# Exemples
node ace acl:create:permission users.create "Create Users"
node ace acl:create:permission users.update "Update Users" \
  --description="Modifier les utilisateurs" \
  --group="users" \
  --route="PUT /users/:id"

# Lister toutes les permissions
node ace acl:list:permissions

# Lister par groupe
node ace acl:list:permissions --group=users

# Assigner une permission à un rôle
node ace acl:assign:permission <permission-slug> --role=<role-slug>
node ace acl:assign:permission users.create --role=admin

# Assigner une permission à un utilisateur
node ace acl:assign:permission <permission-slug> --user=<user-id>
node ace acl:assign:permission users.create --user=1
```

## Synchronisation des Routes

```bash
# Synchroniser les permissions depuis les routes définies
node ace acl:store:access
```

# Protect Routes

Protégez vos routes avec le middleware et la méthode `.access()` :

```ts
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
    // Définir les permissions pour chaque route
    Route.get('users', 'UsersController.index')
        .access('users.list', 'Liste des utilisateurs')

    Route.get('users/:id', 'UsersController.show')
        .access('users.show', 'Détail utilisateur')

    Route.post('users', 'UsersController.store')
        .access('users.create', 'Créer un utilisateur')

    Route.put('users/:id', 'UsersController.update')
        .access('users.update', 'Modifier un utilisateur')

    Route.delete('users/:id', 'UsersController.destroy')
        .access('users.delete', 'Supprimer un utilisateur')

}).prefix('api/v1').middleware('auth')

// Puis synchroniser
// $ node ace acl:store:access
```

## Vérifications Manuelles

```ts
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UsersController {
  public async index({ auth, response }: HttpContextContract) {
    const user = auth.user!

    // Vérifier une permission
    if (!(await user.can('users.list'))) {
      return response.forbidden({ message: 'Accès refusé' })
    }

    // Vérifier un rôle
    if (!(await user.hasRole('admin'))) {
      return response.forbidden({ message: 'Admin requis' })
    }

    // Votre logique
  }
}
```



[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/%40fickou%2Fadonis-access-control-list.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/adonis-request-throttler "npm"

[license-image]: https://img.shields.io/npm/l/%40fickou%2Fadonis-access-control-list?color=blueviolet
[license-url]: LICENSE.md "license"
[my-coffee-image]:https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee
[my-coffee-url]:https://www.buymeacoffee.com/afidosstar

