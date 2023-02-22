import { GetAssetWeightMultisigParams } from "../types";

const getAssetWeightMultisig = ({
  api,
  assetId,
}: GetAssetWeightMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(assetId));
};

export { getAssetWeightMultisig };
