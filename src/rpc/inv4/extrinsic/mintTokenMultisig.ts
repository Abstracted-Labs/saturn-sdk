import type { MintTokenMultisigParams } from "../../../types";

const mintTokenMultisig = ({
  api,
  amount,
  address,
}: MintTokenMultisigParams) => {
  return api.tx.inv4.tokenMint(amount, address);
};

export { mintTokenMultisig };
