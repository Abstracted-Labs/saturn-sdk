import type { BurnTokenMultisigParams } from "../types";

const burnToken = ({ api, id, amount, address }: BurnTokenMultisigParams) => {
  return api.tx.inv4.iptBurn([parseInt(id), null], amount, address);
};

export { burnToken };
