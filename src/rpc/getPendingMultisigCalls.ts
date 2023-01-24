import { DefaultMultisigParams } from "../types";

const getPendingMultisigCalls = ({ api, id }: DefaultMultisigParams) => {
  return api.query.inv4.multisig.entries(parseInt(id));
};

export { getPendingMultisigCalls };
