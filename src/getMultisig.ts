import type { GetMultisigParams } from "./types";

const getMultisig = ({ api, id }: GetMultisigParams) => {
  return api.query.inv4.ipStorage(parseInt(id));
};

export { getMultisig };
