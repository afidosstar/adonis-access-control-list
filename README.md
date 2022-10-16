# adonis-access-control-list
> Add helper on Secure application for Adonis JS 5+

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
npm i --save @fickou/adonis-controller-helpers
```

Install provider:
```bash
node ace configure @fickou/adonis-controller-helpers
```

# Sample Usage
## Controller
In a controller

```ts
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import IndexService from 'App/Services/users/Index'
import Database from "@ioc:Adonis/Lucid/Database";

export default UserController{
public index({ request, response }: HttpContextContract){
        let data = await request.checkInputs();
        await Database.transaction(async (trx) => {
            const executor = new Index(trx);
            return response.apiView(await executor.execute(data));
        });
    }
}
```

## Service

In a service:

```ts
import Parameter from 'App/Models/settings/Parameter';
import ControllerHelper, from "@ioc:Adonis/Addons/ControllerHelper";
import {Service} from "@fickou/adonis-controller-helpers";

export default class Index extends Service {


    async execute(payload) {
        const query = Parameter.query({client: this.trx});
        return ControllerHelper.searchPayload(query, payload);
    }
}

// or 

export default class Index extends Service {


    async execute(payload) {
        const query = ControllerHelper.buildQuery((this.trx || Database), (db) => db.query()
            .from('parameters')
            .select(['*']);
        return ControllerHelper.searchDatabasePayload(query, payload);
    }
}
```



[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/%40fickou%2Fadonis-controller-helpers.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/adonis-request-throttler "npm"

[license-image]: https://img.shields.io/npm/l/%40fickou%2Fadonis-controller-helpers?color=blueviolet
[license-url]: LICENSE.md "license"
[my-coffee-image]:https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee
[my-coffee-url]:https://www.buymeacoffee.com/afidosstar

