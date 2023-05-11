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
  asset: { [key: string]: any };
  destination: string;
  fee: BN;
  amount: BN;
  to?: string | AccountId;
}) => {
    return api.tx.rings.bridgeAssets(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        asset,
        destination, fee, amount, to || null);
};

export { bridgeExternalMultisigAssetCall };
