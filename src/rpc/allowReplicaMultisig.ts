import { DefaultMultisigParams } from "../types";

const allowReplica = ({ api, id }: DefaultMultisigParams) => {
  return api.tx.inv4.allowReplica(parseInt(id));
};

export { allowReplica };
