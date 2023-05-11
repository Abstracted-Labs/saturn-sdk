import { CreateMultisigCallParams } from "../../../types";

const createMultisigCall = ({
  api,
  proposalMetadata,
  call,
  feeAsset,
  id,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    id,
    proposalMetadata ? proposalMetadata : null,
    feeAsset,
    call
  );
};

export { createMultisigCall };
