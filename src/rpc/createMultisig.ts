import type { CreateMultisigParams } from "../types";

const createMultisig = ({
  api,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  metadata,
  assets = [],
}: CreateMultisigParams) => {
  let parsedExecutionThreshold = api.createType("OneOrPercent", {
    Percent: executionThreshold,
  });

  if (executionThreshold < 0) {
    throw new Error("EXECUTION_THRESHOLD_MUST_BE_GREATER_THAN_ZERO");
  }

  if (executionThreshold > 100) {
    throw new Error("EXECUTION_THRESHOLD_MUST_BE_LESS_THAN_OR_EQUAL_TO_100");
  }

  if (executionThreshold === 100) {
    parsedExecutionThreshold = api.createType("OneOrPercent", { One: null });
  }

  let parsedDefaultAssetWeight = api.createType("OneOrPercent", {
    Percent: defaultAssetWeight,
  });

  if (defaultAssetWeight < 0) {
    throw new Error("DEFAULT_ASSET_WEIGHT_MUST_BE_GREATER_THAN_ZERO");
  }

  if (defaultAssetWeight > 100) {
    throw new Error("DEFAULT_ASSET_WEIGHT_MUST_BE_LESS_THAN_OR_EQUAL_TO_100");
  }

  if (defaultAssetWeight === 100) {
    parsedDefaultAssetWeight = api.createType("OneOrPercent", { One: null });
  }

  return api.tx.inv4.createIps(
    JSON.stringify(metadata),
    assets,
    false,
    parsedExecutionThreshold,
    defaultAssetWeight,
    defaultPermission
  );
};

export { createMultisig };
