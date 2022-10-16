/*
 * Copyright (c) 2022.
 * @created 15/10/2022 - 8:45:34
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

// import AclCreateAllAccessPermission from "./AclCreateAllAccessPermission";
// import AclSetup from "./AclSetup";
// import AclStoreAccess from "./AclStoreAccess";
// import Application from "@ioc:Adonis/Core/Application";
import { listDirectoryFiles } from "@adonisjs/ace";

//export default [AclCreateAllAccessPermission, AclSetup, AclStoreAccess];
export default listDirectoryFiles(__dirname, process.cwd(), [
  "./commands/index",
]);
