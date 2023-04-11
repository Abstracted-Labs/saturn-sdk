import { BridgeExternalMultisigAssetCallParams } from "../../../types";

const bridgeExternalMultisigAssetCall = ({
  api,
  asset,
  destination,
  fee,
  amount,
  to,
}: BridgeExternalMultisigAssetCallParams) => {
  return api.tx.rings.bridgeAssets(asset, destination, fee, amount, to);
};

export { bridgeExternalMultisigAssetCall };
