import { SetPermissionMultisigParams } from "../types";

// TODO: Add params
const setPermission = ({ api, id }: SetPermissionMultisigParams) => {
  return api.tx.inv4.setPermission(parseInt(id));
};

export { setPermission };
