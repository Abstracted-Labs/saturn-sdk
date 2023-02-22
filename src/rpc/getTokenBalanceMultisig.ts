import type { GetTokenBalanceMultisigParams } from "../types";

const getTokenBalanceMultisig = ({
  api,
  address,
}: GetTokenBalanceMultisigParams) => {
  return api.query.inv4.balance(null, address);
};

export { getTokenBalanceMultisig };
