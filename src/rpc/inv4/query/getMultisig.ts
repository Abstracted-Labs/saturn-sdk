import type { GetMultisigParams } from "../../../types";

const getMultisig = ({ api, id }: GetMultisigParams) => {
  return api.query.inv4.coreStorage(id);
};

export { getMultisig };
