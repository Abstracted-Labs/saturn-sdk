import type { DefaultMultisigParams } from "../types";

const getAllTokenBalancesMultisig = ({ api }: DefaultMultisigParams) => {
  return api.query.inv4.balance.entries();
};

export { getAllTokenBalancesMultisig };
