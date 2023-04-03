import { TransferExternalAssetMultisigCallParams } from "../../../types";

const transferExternalAssetMultisigCall = ({
  api,
  destination,
  asset,
  amount,
  to,
}: TransferExternalAssetMultisigCallParams) => {
  return api.tx.rings.transferAssets(
    { [destination]: { [asset]: null } },
    amount,
    to
  );
};

export { transferExternalAssetMultisigCall };
