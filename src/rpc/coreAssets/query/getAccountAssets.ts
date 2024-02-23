import { GetMultisigsForAccountParams } from "../../../types";

const getAccountAssets = ({ api, account }: GetMultisigsForAccountParams) => {
  return api.query.coreAssets.accounts.entries(account);
};

export { getAccountAssets };
