import { AppendToMultisigParams } from "../types";

// TODO: Add params
const append = ({ api, id }: AppendToMultisigParams) => {
  return api.tx.inv4.append(parseInt(id));
};

export { append };
