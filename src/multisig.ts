import { ApiPromise } from "@polkadot/api";
import { Signer } from "@polkadot/types/types";

import {
  createMultisig,
  createMultisigCall,
  getMultisig,
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

class Multisig {
  readonly api: ApiPromise;
  id: string;

  constructor({ api, id }: { api: ApiPromise; id?: string }) {
    if (!api.tx.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for extrinsics");
    }

    if (!api.query.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for queries");
    }
    this.api = api;

    if (id) {
      this.id = id;
    }
  }

  create = ({
    defaultAssetWeight = 0,
    defaultPermission = false,
    executionThreshold = 1,
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
  }: Omit<CreateMultisigParams, "api"> &
    GetSignAndSendCallbackParams & {
      address: string;
      signer: Signer;
    }): Promise<Multisig> => {
    return new Promise((resolve, reject) => {
      try {
        createMultisig({
          api: this.api,
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
              const rawEvent = result.events.find(
                ({ event }) => event.method === "IPSCreated"
              );

              if (!rawEvent) {
                throw new Error("SOMETHING_WENT_WRONG");
              }

              const { event } = rawEvent.toPrimitive() as {
                event: {
                  data: [number, number, number];
                };
              };

              console.log(event);

              const ipsId = event.data[1];

              if (!ipsId) {
                throw new Error("SOMETHING_WENT_SUPER_WRONG");
              }

              if (onSuccess) onSuccess(result);

              resolve(new Multisig({ api: this.api, id: ipsId.toString() }));
            },
            onUnknown,
          })
        );
      } catch (e) {
        reject(e);
      }
    });
  };

  info = () => {
    return getMultisig({ api: this.api, id: this.id });
  };

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

  isCreated = () => {
    if (this.id) return true;

    return false;
  };

  disconnect = () => {
    this.api.disconnect();
  };
}

export { Multisig };
