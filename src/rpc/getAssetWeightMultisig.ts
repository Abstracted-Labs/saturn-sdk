import { GetAssetWeightMultisigParams } from "../types";

const getAssetWeightMultisig = ({
  api,
  id,
  assetId,
}: GetAssetWeightMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(id), parseInt(assetId));
};

export { getAssetWeightMultisig };
