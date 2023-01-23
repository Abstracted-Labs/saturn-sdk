import type { GetTokenBalanceMultisigParams } from "../types";

const getTokenBalanceMultisig = ({
  api,
  id,
  address,
}: GetTokenBalanceMultisigParams) => {
  return api.query.inv4.balance([parseInt(id), null], address);
};

export { getTokenBalanceMultisig };
