import { SendExternalMultisigCallParams } from "../../../types";

const sendExternalMultisigCall = ({
  api,
  destination,
  weight,
  callData,
  feeAsset,
  fee,
}: SendExternalMultisigCallParams) => {
    return api.tx.rings.sendCall(destination, weight, feeAsset, fee, callData);
};

export { sendExternalMultisigCall };
