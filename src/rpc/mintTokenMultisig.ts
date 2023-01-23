import type { MintTokenMultisigParams } from "../types";

const mintToken = ({ api, id, amount, address }: MintTokenMultisigParams) => {
  return api.tx.inv4.iptMint([parseInt(id), null], amount, address);
};

export { mintToken };
