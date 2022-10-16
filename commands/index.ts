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

function resolve(path) {
  return `@fickou/adonis-access-control-list/build/commands/${path}`;
}

export default [
  resolve("AclCreateAllAccessPermission"),
  resolve("AclSetup"),
  resolve("AclStoreAccess"),
];

//export default listDirectoryFiles(__dirname, Application, [
//  "./commands/index",
//]);
