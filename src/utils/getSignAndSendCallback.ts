import { ISubmittableResult } from "@polkadot/types/types";

import { GetSignAndSendCallbackParams } from "../types";

const getSignAndSendCallback = ({
  onDropped,
  onError,
  onExecuted,
  onInvalid,
  onLoading,
  onSuccess,
  onUnknown,
}: GetSignAndSendCallbackParams) => {
  return (result: ISubmittableResult) => {
    if (result.status.isInvalid) {
      if (onInvalid) onInvalid(result);
    } else if (result.status.isReady) {
      if (onLoading) onLoading(result);
    } else if (result.status.isDropped) {
      if (onDropped) onDropped(result);
    } else if (result.status.isInBlock || result.status.isFinalized) {
      const isCreated = result.events.find(
        ({ event }) => event.method === "IPSCreated"
      );

      if (!isCreated) {
        if (onError) onError(result);
      }

      if (onSuccess) onSuccess(result);
    } else {
      if (onUnknown) onUnknown(result);
    }

    if (onExecuted) onExecuted(result);
  };
};

export { getSignAndSendCallback };
