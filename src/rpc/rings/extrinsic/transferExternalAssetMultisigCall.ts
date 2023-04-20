import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { AccountId } from "@polkadot/types/interfaces";

const transferExternalAssetMultisigCall = ({
  api,
  asset,
  amount,
  to,
  feeAsset,
  fee,
}: {
  api: ApiPromise;
  asset: Object;
  amount: BN;
  to: string | AccountId;
  feeAsset: Object;
  fee: BN;
}) => {
  return api.tx.rings.transferAssets(asset, amount, to, feeAsset, fee);
};

export { transferExternalAssetMultisigCall };
