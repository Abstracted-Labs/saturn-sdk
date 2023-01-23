import type { GetAllTokenBalancesMultisigParams } from "../types";

const getAllTokenBalancesMultisig = ({
  api,
  id,
}: GetAllTokenBalancesMultisigParams) => {
  return api.query.inv4.balance.entries([parseInt(id), null]);
};

export { getAllTokenBalancesMultisig };
