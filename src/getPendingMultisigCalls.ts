import { GetPendingMultisigCallsParams } from "./types";

const getPendingMultisigCalls = ({
  api,
  id,
}: GetPendingMultisigCallsParams) => {
  return api.query.inv4.multisigs.entries(parseInt(id));
};

export default getPendingMultisigCalls;
