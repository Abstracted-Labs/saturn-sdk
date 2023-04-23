import { BN } from "@polkadot/util";
import { ApiPromise } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";

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
  callData: `0x{string}` | Uint8Array;
  feeAsset: Object;
  fee: BN;
}) => {
    return api.tx.rings.sendCall(destination, weight, feeAsset, fee, typeof callData === "string" ? callData : u8aToHex(callData));
};

export { sendExternalMultisigCall };
