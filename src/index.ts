import "@polkadot/api-augment";

import type { ISubmittableResult } from "@polkadot/types/types";
import type {
  CreateMultisigCallParams,
  CreateMultisigParams,
  GetMultisigParams,
  GetPendingMultisigCallsParams,
  GetSignAndSendCallbackParams,
  VoteMultisigCallParams,
  WithdrawMultisigCallParams,
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

const createMultisig = ({
  api,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  metadata,
  assets = [],
}: CreateMultisigParams) => {
  return api.tx.inv4.createIps(
    JSON.stringify(metadata),
    assets,
    false,
    "Apache2",
    api.createType("OneOrPercent", { Percent: executionThreshold }),
    api.createType("OneOrPercent", { Percent: defaultAssetWeight }),
    defaultPermission
  );
};

const getPendingMultisigCalls = ({
  api,
  id,
}: GetPendingMultisigCallsParams) => {
  return api.query.multisig.multisigs.entries(parseInt(id));
};

const getMultisig = ({ api, id }: GetMultisigParams) => {
  return api.query.inv4.ipStorage(parseInt(id));
};

const createMultisigCall = ({
  api,
  id,
  metadata,
  calls,
}: CreateMultisigCallParams) => {
  return api.tx.inv4.operateMultisig(
    true,
    [parseInt(id), null],
    JSON.stringify(metadata),
    api.tx.utility.batchAll(calls)
  );
};

const voteMultisigCall = ({ api, id, callHash }: VoteMultisigCallParams) => {
  return api.tx.inv4.voteMultisig([parseInt(id), null], callHash);
};

const withdrawVoteMultisigCall = ({
  api,
  id,
  callHash,
}: WithdrawMultisigCallParams) => {
  return api.tx.inv4.voteMultisig([parseInt(id), null], callHash);
};

export {
  getSignAndSendCallback,
  getPendingMultisigCalls,
  createMultisig,
  getMultisig,
  createMultisigCall,
  voteMultisigCall,
  withdrawVoteMultisigCall,
};
