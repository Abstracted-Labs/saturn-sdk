import type { CreateMultisigParams } from "../../../types";

const createDao = ({
  api,
  metadata,
  minimumSupport,
  requiredApproval,
  creationFeeAsset,
}: CreateMultisigParams) => {
  return api.tx.inv4.createDao(
    JSON.stringify(metadata),
    minimumSupport,
    requiredApproval,
    creationFeeAsset,
  );
};

export { createDao as createCore };
