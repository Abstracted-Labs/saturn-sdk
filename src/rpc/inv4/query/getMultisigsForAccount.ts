import { getMultisigsForAccountParams } from "../../../types";

const getMultisigsForAccount = ({
  api,
  account,
}: getMultisigsForAccountParams) => {
  return api.query.coreAssets.accounts.entries(account);
};

export { getMultisigsForAccount };
