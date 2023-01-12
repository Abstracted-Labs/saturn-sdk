import { ApiPromise } from "@polkadot/api";
import { Signer } from "@polkadot/types/types";

import {
  createMultisig,
  createMultisigCall,
  getPendingMultisigCalls,
  voteMultisigCall,
  withdrawVoteMultisigCall,
} from "./rpc";

import {
  CreateMultisigParams,
  CreateMultisigCallParams,
  GetPendingMultisigCallsParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  GetSignAndSendCallbackParams,
} from "./types";

import { getSignAndSendCallback } from "./utils";

const generateMultisig = async ({
  api,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  metadata,
  assets,
  onDropped,
  onError,
  onExecuted,
  onInvalid,
  onLoading,
  onSuccess,
  onUnknown,
  address,
  signer,
}: CreateMultisigParams &
  GetSignAndSendCallbackParams & { address: string; signer: Signer }) => {
  try {
    new Promise(async (resolve, reject) => {
      await createMultisig({
        api,
        defaultAssetWeight,
        defaultPermission,
        executionThreshold,
        metadata,
        assets,
      }).signAndSend(
        address,
        { signer },
        getSignAndSendCallback({
          onDropped,
          onError,
          onExecuted,
          onInvalid,
          onLoading,
          onSuccess: async (result) => {
            const hasVoteStarted = result.events.find(
              ({ event }) => event.method === "MultisigVoteStarted"
            );

            const hasExecuted = result.events.find(
              ({ event }) => event.method === "MultisigExecuted"
            );

            if (hasVoteStarted) {
              const event = hasVoteStarted.event.toPrimitive() as {
                data: { ipsId: string };
              };

              const id = event.data.ipsId;

              if (onSuccess) onSuccess(result);

              resolve(new Multisig({ api, id }));
            } else if (hasExecuted) {
              const event = hasExecuted.event.toPrimitive() as {
                data: { ipsId: string };
              };

              const id = event.data.ipsId;

              if (onSuccess) onSuccess(result);

              resolve(new Multisig({ api, id }));
            }
          },
          onUnknown,
        })
      );
    });
  } catch (e) {
    throw new Error("Error creating multisig", e);
  }
};

class Multisig {
  readonly api: ApiPromise;
  readonly id: string;

  constructor({ api, id }: { api: ApiPromise; id: string }) {
    if (!api.tx.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for extrinsics");
    }

    if (!api.query.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for queries");
    }

    if (!api.tx.inv4.createIps) {
      throw new Error("ApiPromise does not contain inv4.createIps extrinsics");
    }

    if (!api.tx.inv4.operateMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.operateMultisig extrinsics"
      );
    }

    if (!api.query.inv4.ipStorage) {
      throw new Error("ApiPromise does not contain inv4.ipStorage query");
    }

    if (!api.query.inv4.multisigs) {
      throw new Error("ApiPromise does not contain inv4.multisigs query");
    }

    if (!api.tx.inv4.voteMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.voteMultisig extrinsics"
      );
    }

    if (!api.tx.inv4.withdrawVoteMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.withdrawVoteMultisig extrinsics"
      );
    }

    this.api = api;
    this.id = id;
  }

  createCall = ({ ...params }: Omit<CreateMultisigCallParams, "api">) => {
    return createMultisigCall({ api: this.api, ...params });
  };

  getPendingCalls = ({
    ...params
  }: Omit<GetPendingMultisigCallsParams, "api">) => {
    return getPendingMultisigCalls({ api: this.api, ...params });
  };

  vote = ({ ...params }: Omit<VoteMultisigCallParams, "api">) => {
    return voteMultisigCall({ api: this.api, ...params });
  };

  withdrawVote = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api">) => {
    return withdrawVoteMultisigCall({ api: this.api, ...params });
  };
}

export { Multisig, generateMultisig };
