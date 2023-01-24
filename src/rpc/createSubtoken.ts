import { CreateSubtokenMultisigParams } from "../types";

// TODO: Add params
const createSubtoken = ({ api, id }: CreateSubtokenMultisigParams) => {
  return api.tx.inv4.createSubtoken(parseInt(id));
};

export { createSubtoken };
