import type { CreateMultisigParams } from "../../../types";

const createCore = ({
  api,
  metadata,
  minimumSupport,
  requiredApproval,
  creationFeeAsset,
}: CreateMultisigParams) => {
  return api.tx.inv4.createCore(
    JSON.stringify(metadata),
    minimumSupport,
    requiredApproval,
    creationFeeAsset,
  );
};

export { createCore };
