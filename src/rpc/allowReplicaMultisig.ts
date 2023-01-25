import { DefaultMultisigParams } from "../types";

const allowReplicaMultisig = ({ api, id }: DefaultMultisigParams) => {
  return api.tx.inv4.allowReplica(parseInt(id));
};

export { allowReplicaMultisig };
