import { ISubmittableResult } from "@polkadot/types/types";

import { GetSignAndSendCallbackParams } from "../types";

const getSignAndSendCallback = ({
  onDropped,
  onError,
  onExecuted,
  onInvalid,
  onLoading,
  onSuccess,
}: GetSignAndSendCallbackParams) => {
  return (result: ISubmittableResult) => {
    if (result.status.isInvalid) {
      if (onInvalid) onInvalid(result);
    } else if (result.status.isReady) {
      if (onLoading) onLoading(result);
    } else if (result.status.isDropped) {
      if (onDropped) onDropped(result);
    } else if (result.status.isInBlock || result.status.isFinalized) {
      const hasVoteStarted = result.events.find(
        ({ event }) => event.method === "MultisigVoteStarted"
      );

      const hasExecuted = result.events.find(
        ({ event }) => event.method === "MultisigExecuted"
      );

      const hasFailed = result.events.find(
        ({ event }) => event.method === "ExtrinsicFailed"
      );

      if (hasExecuted) {
        if (onSuccess) onSuccess(result);
      } else if (hasVoteStarted) {
        if (onSuccess) onSuccess(result);
      } else if (hasFailed) {
        if (onError) onError(result);
      } else throw new Error("UNKNOWN_RESULT");
    }

    if (onExecuted) onExecuted(result);
  };
};

export default getSignAndSendCallback;
