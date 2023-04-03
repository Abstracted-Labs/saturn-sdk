import { GetPendingMultisigCallParams } from "../../../types";

const getPendingMultisigCall = ({
  api,
  id,
  callHash,
}: GetPendingMultisigCallParams) => {
  return api.query.inv4.multisig(parseInt(id), callHash);
};

export { getPendingMultisigCall };
