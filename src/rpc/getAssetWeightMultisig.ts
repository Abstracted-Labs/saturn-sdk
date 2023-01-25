import { GetAssetWeightMultisigParams } from "../types";

const getAssetWeight = ({ api, id, assetId }: GetAssetWeightMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(id), parseInt(assetId));
};

export { getAssetWeight };
