import { GetSubAssetMultisigParams } from "../types";

const getSubAssetMultisig = ({
  api,
  id,
  subAssetId,
}: GetSubAssetMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(id), parseInt(subAssetId));
};

export { getSubAssetMultisig };
