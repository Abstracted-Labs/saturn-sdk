import { CreateMultisigCallParams } from "../../../types";

const createMultisigCall = ({
  api,
  metadata,
  calls,
  id,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    id,
    JSON.stringify(metadata),
    api.tx.utility.batchAll(calls)
  );
};

export { createMultisigCall };
