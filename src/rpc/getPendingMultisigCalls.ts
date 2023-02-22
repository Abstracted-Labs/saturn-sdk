import { DefaultMultisigParams } from "../types";

const getPendingMultisigCalls = ({ api }: DefaultMultisigParams) => {
  return api.query.inv4.multisig.entries();
};

export { getPendingMultisigCalls };
