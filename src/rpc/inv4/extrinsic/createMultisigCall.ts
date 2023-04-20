import { CreateMultisigCallParams } from "../../../types";

const createMultisigCall = ({
  api,
  proposalMetadata,
  call,
  id,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    id,
      proposalMetadata ? proposalMetadata : null,
    call
  );
};

export { createMultisigCall };
