import { u8aToHex } from "@polkadot/util";
import { SendExternalMultisigCallParams } from "../../../types";

const sendExternalMultisigCall = ({
  api,
  destination,
  weight,
  callData,
  xcmFeeAsset,
  xcmFee,
}: SendExternalMultisigCallParams) => {
    return api.tx.rings.sendCall(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        destination,
        weight, xcmFeeAsset, xcmFee, typeof callData === "string" ? callData : u8aToHex(callData));
};

export { sendExternalMultisigCall };
