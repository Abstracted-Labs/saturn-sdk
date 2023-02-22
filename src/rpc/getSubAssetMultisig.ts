import { GetSubAssetMultisigParams } from "../types";

const getSubAssetMultisig = ({
  api,
  subAssetId,
}: GetSubAssetMultisigParams) => {
  return api.query.inv4.assetWeight(parseInt(subAssetId));
};

export { getSubAssetMultisig };
