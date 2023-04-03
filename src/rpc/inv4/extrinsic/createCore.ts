import type { CreateMultisigParams } from "../../../types";

const createCore = ({
  api,
  metadata,
  minimumSupport,
  requiredApproval,
}: CreateMultisigParams) => {
  return api.tx.inv4.createCore(
    JSON.stringify(metadata),
    minimumSupport,
    requiredApproval
  );
};

export { createCore };
