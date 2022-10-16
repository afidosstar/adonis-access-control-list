# adonis-access-control-list
> Add Access Control List (acl) for Adonis JS 5+

[![typescript-image]][typescript-url] 
[![npm-image]][npm-url] 
[![license-image]][license-url]
[![my-coffee-image]][my-coffee-url]


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Installation](#installation)
- [Sample Usage](#sample-usage)
  

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation
Run:
```bash
npm i --save @fickou/adonis-access-control-list
```

Install provider:
```bash
node ace configure @fickou/adonis-access-control-list
```
# Configuration
## config
Go to `config/acl.ts` and defined you own configuration:

```ts
import { ConfigAclContract } from "@ioc:Adonis/Addons/AdonisAccessControlList";

const configAcl: ConfigAclContract = {
    prefix: "acl",
    middlewares: "auth:api",
    joinTables: {
        permissionAccess: "permission_access",
        permissionRole: "permission_role",
        permissionUser: "permission_user",
        userRole: "user_role",
    },
    /**
     * `apiOnly` is used for auto configure view for assign access to permission
     * by default it's false, if you want to use it, you need to set it to true
     */
    apiOnly: false,
};

export default configAcl
```

## Aliases
Go to `.adonisrc.json` and add aliases:

```ts
{
    "aliases": {
    "BaseUser": "Adonis/Addons/Acl/BaseUser",
    "Role": "Adonis/Addons/Acl/Role",
    "Access": "Adonis/Addons/Acl/Access",
    "Permission": "Adonis/Addons/Acl/Permission",
  
  }
}
```

## Registering middleware

Register the following middleware inside `start/kernel.ts` file.

```ts
Server.middleware.register([
    ...,
    'Adonis/Addons/Acl/Authorize',
])
```

## Models
Go to `App/Models/User.ts`, Compose user model with `BaseUser`:

```ts
import {BaseModel, column} from '@ioc:Adonis/Lucid/Orm'
import {compose} from "@poppinss/utils/build/src/Helpers";
import BaseUser from "@ioc:BaseUser";
import {authUser} from "@fickou/adonis-access-control-list";

export default class User extends compose(BaseModel, BaseUser) {
    @column({isPrimary: true})
    public id: number

    @column()
    public name: string

    @column()
    public email: string

    @column()
    public password: string

    // @authUser()
    // created_by: number;
    
    // @authUser({isUpdate: true})
    // updated_by: number;
}
```



# Protect Routes
 Protect routes with middleware
## Routes

```ts
import {Route} from "@adonisjs/http-server/build/src/Router/Route";

Route.group(() => {
    Route.get('users', 'UsersController.index')
        .access('list_user', 'List users');
    Route.get('users/:id', 'UsersController.show')
        .access('show_user', 'Show detail user');
    Route.post('users', 'UsersController.store')
        .access('show_user', 'Show detail user');
    Route.put('users/:id', 'UsersController.update')
        .access('update_user', 'Update user');
    Route.delete('users/:id', 'UsersController.destroy')
        .access('destroy_user', 'Destroy user');
    
    //or
    
    Route.ressource('users', 'UsersController')
        .access('user', 'User')
        
}).prefix('api/v1');
```



[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/%40fickou%2Fadonis-access-control-list.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/adonis-request-throttler "npm"

[license-image]: https://img.shields.io/npm/l/%40fickou%2Fadonis-access-control-list?color=blueviolet
[license-url]: LICENSE.md "license"
[my-coffee-image]:https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee
[my-coffee-url]:https://www.buymeacoffee.com/afidosstar

