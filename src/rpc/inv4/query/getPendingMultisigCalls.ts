import { GetPendingMultisigCallsParams } from "../../../types";

const getPendingMultisigCalls = ({
  api,
  id,
}: GetPendingMultisigCallsParams) => {
  return api.query.inv4.multisig.entries(parseInt(id));
};

export { getPendingMultisigCalls };
