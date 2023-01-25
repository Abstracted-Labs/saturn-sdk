import type { MintTokenMultisigParams } from "../types";

const mintTokenMultisig = ({
  api,
  id,
  amount,
  address,
}: MintTokenMultisigParams) => {
  return api.tx.inv4.iptMint([parseInt(id), null], amount, address);
};

export { mintTokenMultisig };
