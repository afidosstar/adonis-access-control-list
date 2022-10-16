/*
 * @created 13/10/2022 - 16:51
 * @project adonis-access-control-list
 * @author "fiacre.ayedoun@gmail.com"
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module "@ioc:Adonis/Addons/Auth" {
  export interface GuardsList {
    jwt: {
      implementation: any;
      config: any;
    };
  }
  export interface ProvidersList {
    jwt: {
      implementation: any;
      config: any;
    };
  }
}
