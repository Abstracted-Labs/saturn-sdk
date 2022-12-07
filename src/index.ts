import "@polkadot/api-augment";

import { SubmittableExtrinsic } from "@polkadot/api/types";
import type { ISubmittableResult } from "@polkadot/types/types";
import type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
} from "./types";

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

const createMultisig = async ({
  api,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  allowReplica,
  metadata,
  assets = [],
}: CreateMultisigParams): Promise<
  SubmittableExtrinsic<"promise", ISubmittableResult>
> => {
  return api.tx.inv4.createIps(
    JSON.stringify(metadata),
    assets,
    allowReplica,
    "Apache2",
    api.createType("OneOrPercent", { Percent: executionThreshold }),
    api.createType("OneOrPercent", { Percent: defaultAssetWeight }),
    defaultPermission
  );
};

export { createMultisig, getSignAndSendCallback };
