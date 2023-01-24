import { GetAssetWeightMultisigParams } from "../types";

// TODO: Add params
const getAssetWeight = ({ api, id }: GetAssetWeightMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(id));
};

export { getAssetWeight };
