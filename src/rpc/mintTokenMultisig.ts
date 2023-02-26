import type { MintTokenMultisigParams } from "../types";

const mintTokenMultisig = ({
  api,
  amount,
  address,
  token,
}: MintTokenMultisigParams) => {
  return api.tx.inv4.iptMint(token, amount, address);
};

export { mintTokenMultisig };
