/*
 * @created 13/10/2022 - 19:09
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const knex = require('knex')({client: 'postgres'});
const query = knex.from('accesses')
.distinct('slug')
.leftJoin('permissions_accesses', 'permissions_accesses.access_id', 'accesses.id')
.leftJoin('permissions', 'permissions_accesses.permission_id', 'permissions.id')
.leftJoin('permissions', 'permissions_accesses.permission_id', 'permissions.id')

.leftJoin('permissions_users', 'permissions_users.permission_id', 'permissions.id')
.leftJoin('permissions_roles', 'permissions_roles.permission_id', 'permissions.id')
.leftJoin('roles', 'permissions_roles.role_id', 'roles.id')
.leftJoin('users_roles', 'users_roles.role_id', 'roles.id')
.where('permissions_users.user_id', 1)
.orWhere('users_roles.user_id', 1);

console.log(query.toQuery())