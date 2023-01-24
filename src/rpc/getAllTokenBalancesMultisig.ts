import type { DefaultMultisigParams } from "../types";

const getAllTokenBalancesMultisig = ({ api, id }: DefaultMultisigParams) => {
  return api.query.inv4.balance.entries([parseInt(id), null]);
};

export { getAllTokenBalancesMultisig };
