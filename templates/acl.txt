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
  apiOnly: false,
};

export default configAcl;
