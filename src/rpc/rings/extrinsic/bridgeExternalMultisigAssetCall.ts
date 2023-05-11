import { BridgeExternalMultisigAssetParams } from "../../../types";

const bridgeExternalMultisigAssetCall = ({
  api,
  asset,
  destination,
  xcmFee,
  amount,
  to,
}: BridgeExternalMultisigAssetParams) => {
    return api.tx.rings.bridgeAssets(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        asset,
        destination, xcmFee, amount, to || null);
};

export { bridgeExternalMultisigAssetCall };
