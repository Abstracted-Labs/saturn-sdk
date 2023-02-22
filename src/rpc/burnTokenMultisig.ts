import type { BurnTokenMultisigParams } from "../types";

const burnTokenMultisig = ({
  api,
  amount,
  address,
}: BurnTokenMultisigParams) => {
  return api.tx.inv4.iptBurn(null, amount, address);
};

export { burnTokenMultisig };
