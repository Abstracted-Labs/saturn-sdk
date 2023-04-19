import { BN } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';
import { AnyJson } from '@polkadot/types/types';

const sendExternalMultisigCall = ({
  api,
  destination,
  weight,
  callData,
  feeAsset,
  fee,
}: {
    api: ApiPromise;
    destination: string;
    weight: BN;
    callData: Uint8Array;
    feeAsset: Object;
    fee: BN;
}) => {
    return api.tx.rings.sendCall(destination, weight, feeAsset, fee, callData);
};

export { sendExternalMultisigCall };
