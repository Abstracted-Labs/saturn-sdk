import { TransferExternalAssetMultisigCallParams } from "../../../types";

const transferExternalAssetMultisigCall = ({
  api,
  asset,
  amount,
  to,
  feeAsset,
  fee,
}: TransferExternalAssetMultisigCallParams) => {
  return api.tx.rings.transferAssets(
    asset,
    amount,
    to,
    feeAsset,
    fee
  );
};

export { transferExternalAssetMultisigCall };
