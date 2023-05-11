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
  asset: { [key: string]: any };
  amount: BN;
  to: string | AccountId;
  feeAsset: Object;
  fee: BN;
}) => {
  return api.tx.rings.transferAssets(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      asset,
      amount, to, feeAsset, fee);
};

export { transferExternalAssetMultisigCall };
