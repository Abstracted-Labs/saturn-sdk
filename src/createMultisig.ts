import type { CreateMultisigParams } from "./types";

const createMultisig = ({
  api,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  metadata,
  assets = [],
}: CreateMultisigParams) => {
  return api.tx.inv4.createIps(
    JSON.stringify(metadata),
    assets,
    false,
    "Apache2",
    api.createType("OneOrPercent", { Percent: executionThreshold }),
    api.createType("OneOrPercent", { Percent: defaultAssetWeight }),
    defaultPermission
  );
};

export { createMultisig };
