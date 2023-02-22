import { CreateMultisigCallParams } from "../types";

const createMultisigCall = ({
  api,
  metadata,
  calls,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    false,
    null,
    JSON.stringify(metadata),
    api.tx.utility.batchAll(calls)
  );
};

export { createMultisigCall };
