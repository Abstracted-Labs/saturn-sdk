import { SendExternalMultisigCallParams } from "../types";

const sendExternalMultisigCall = ({
  api,
  destination,
  weight,
  callHash,
}: SendExternalMultisigCallParams) => {
  return api.tx.rings.sendCall(destination, weight, callHash);
};

export { sendExternalMultisigCall };
