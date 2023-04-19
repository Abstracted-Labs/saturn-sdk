import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

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
    to: string;
    feeAsset: Object;
    fee: BN;
}) => {
  return api.tx.rings.transferAssets(
    asset,
    amount,
    to,
    feeAsset,
    fee
  );
};

export { transferExternalAssetMultisigCall };
