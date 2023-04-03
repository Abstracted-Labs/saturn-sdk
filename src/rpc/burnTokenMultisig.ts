import type { BurnTokenMultisigParams } from "../types";

const burnTokenMultisig = ({
  api,
  amount,
  address,
}: BurnTokenMultisigParams) => {
  return api.tx.inv4.tokenBurn(amount, address);
};

export { burnTokenMultisig };
