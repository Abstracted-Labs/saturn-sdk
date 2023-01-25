import type { BurnTokenMultisigParams } from "../types";

const burnTokenMultisig = ({
  api,
  id,
  amount,
  address,
}: BurnTokenMultisigParams) => {
  return api.tx.inv4.iptBurn([parseInt(id), null], amount, address);
};

export { burnTokenMultisig };
