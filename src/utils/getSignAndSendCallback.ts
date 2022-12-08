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
  return ({ events, status }: ISubmittableResult) => {
    if (status.isInvalid) {
      if (onInvalid) onInvalid();
    } else if (status.isReady) {
      if (onLoading) onLoading();
    } else if (status.isDropped) {
      if (onDropped) onDropped();
    } else if (status.isInBlock || status.isFinalized) {
      const multisigVoteStarted = events.find(
        ({ event }) => event.method === "MultisigVoteStarted"
      );

      const multisigExecuted = events.find(
        ({ event }) => event.method === "MultisigExecuted"
      );

      const failed = events.find(
        ({ event }) => event.method === "ExtrinsicFailed"
      );

      if (multisigExecuted) {
        if (onSuccess) onSuccess();
      } else if (multisigVoteStarted) {
        if (onSuccess) onSuccess();
      } else if (failed) {
        if (onError) onError();

        console.error(failed.toHuman(true));
      } else throw new Error("UNKNOWN_RESULT");
    }

    if (onExecuted) onExecuted();
  };
};

export default getSignAndSendCallback;
