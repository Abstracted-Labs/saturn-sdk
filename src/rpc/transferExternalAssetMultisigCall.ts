import { TransferExternalAssetMultisigCallParams } from "../types";

const transferExternalAssetMultisigCall = ({
  api,
  destination,
  asset,
  amount,
  to,
}: TransferExternalAssetMultisigCallParams) => {
  return api.tx.rings.transferAssets([destination, asset], amount, to);
};

export { transferExternalAssetMultisigCall };
