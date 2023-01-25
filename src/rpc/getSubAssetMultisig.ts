import { GetSubAssetMultisigParams } from "../types";

const getSubAsset = ({ api, id, subAssetId }: GetSubAssetMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(id), parseInt(subAssetId));
};

export { getSubAsset };
