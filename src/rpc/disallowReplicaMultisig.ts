import { DefaultMultisigParams } from "../types";

const disallowReplicaMultisig = ({ api, id }: DefaultMultisigParams) => {
  return api.tx.inv4.disallowReplica(parseInt(id));
};

export { disallowReplicaMultisig };
