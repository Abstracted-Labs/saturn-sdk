import { GetMultisigsForAccountParams } from "../../../types";

const getMultisigsForAccount = ({
  api,
  account,
}: GetMultisigsForAccountParams) => {
  return api.query.coreAssets.accounts.entries(account);
};

export { getMultisigsForAccount };
