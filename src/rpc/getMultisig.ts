import type { DefaultMultisigParams } from "../types";

const getMultisig = ({ api, id }: DefaultMultisigParams) => {
  return api.query.inv4.ipStorage(parseInt(id));
};

export { getMultisig };
