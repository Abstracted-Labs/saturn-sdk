import type { GetMultisigParams } from "../types";

const getMultisig = ({ api, id }: GetMultisigParams) => {
  return api.query.inv4.coreStorage(parseInt(id));
};

export { getMultisig };
