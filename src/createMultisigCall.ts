import { CreateMultisigCallParams } from "./types";

const createMultisigCall = ({
  api,
  id,
  metadata,
  calls,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    true,
    [parseInt(id), null],
    JSON.stringify(metadata),
    api.tx.utility.batchAll(calls)
  );
};

export default createMultisigCall;
