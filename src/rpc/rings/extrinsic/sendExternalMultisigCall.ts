import { SendExternalMultisigCallParams } from "../../../types";

const sendExternalMultisigCall = ({
  api,
  destination,
  weight,
  callData,
}: SendExternalMultisigCallParams) => {
  return api.tx.rings.sendCall(destination, weight, callData);
};

export { sendExternalMultisigCall };
