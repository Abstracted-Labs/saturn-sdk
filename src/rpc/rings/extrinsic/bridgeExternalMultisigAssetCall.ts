import { ApiPromise } from "@polkadot/api";
import { BN } from "@polkadot/util";
import { AccountId } from "@polkadot/types/interfaces";

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
  to?: string | AccountId;
}) => {
  return api.tx.rings.bridgeAssets(asset, destination, fee, amount, to || null);
};

export { bridgeExternalMultisigAssetCall };
