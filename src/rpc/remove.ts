import { RemoveFromMultisigParams } from "../types";

// TODO: Add params
const remove = ({ api, id }: RemoveFromMultisigParams) => {
  return api.tx.inv4.remove(parseInt(id));
};

export { remove };
