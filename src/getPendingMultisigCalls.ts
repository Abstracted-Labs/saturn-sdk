import { GetPendingMultisigCallsParams } from "./types";

const getPendingMultisigCalls = ({
  api,
  id,
}: GetPendingMultisigCallsParams) => {
  return api.query.multisig.multisigs.entries(parseInt(id));
};

export default getPendingMultisigCalls;
