import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';

const bridgeExternalMultisigAssetCall = ({
  api,
  asset,
  destination,
  fee,
  amount,
  to,
}: {
    api: ApiPromise;
    asset: Object;
    destination: string;
    fee: BN;
    amount: BN;
    to: string;
}) => {
  return api.tx.rings.bridgeAssets(asset, destination, fee, amount, to);
};

export { bridgeExternalMultisigAssetCall };
