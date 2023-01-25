import { DefaultMultisigParams } from "../types";

const disallowReplica = ({ api, id }: DefaultMultisigParams) => {
  return api.tx.inv4.disallowReplica(parseInt(id));
};

export { disallowReplica };
