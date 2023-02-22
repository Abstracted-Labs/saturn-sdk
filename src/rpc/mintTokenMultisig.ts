import type { MintTokenMultisigParams } from "../types";

const mintTokenMultisig = ({
  api,
  amount,
  address,
}: MintTokenMultisigParams) => {
  return api.tx.inv4.iptMint(null, amount, address);
};

export { mintTokenMultisig };
