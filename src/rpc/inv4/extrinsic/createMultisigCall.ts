import { CreateMultisigCallParams } from "../../../types";

const createMultisigCall = ({
  api,
  metadata,
  call,
  id,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    id,
    JSON.stringify(metadata),
    call
  );
};

export { createMultisigCall };
