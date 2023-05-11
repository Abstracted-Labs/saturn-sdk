import { TransferExternalAssetMultisigCallParams } from "../../../types";

const transferExternalAssetMultisigCall = ({
  api,
  asset,
  amount,
  to,
  xcmFeeAsset,
  xcmFee,
}: TransferExternalAssetMultisigCallParams) => {
  return api.tx.rings.transferAssets(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      asset,
      amount, to, xcmFeeAsset, xcmFee);
};

export { transferExternalAssetMultisigCall };
