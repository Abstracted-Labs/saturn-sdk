import { ApiPromise } from "@polkadot/api";
import { Signer } from "@polkadot/types/types";

import {
  createMultisig,
  createMultisigCall,
  getMultisig,
  getPendingMultisigCalls,
  voteMultisigCall,
  withdrawVoteMultisigCall,
  mintToken,
  burnToken,
  getTokenBalanceMultisig,
  getAllTokenBalancesMultisig,
  allowReplica,
  disallowReplica,
  append,
  remove,
  createSubtoken,
  setSubtokenWeight,
  getAssetWeight,
  setPermission,
} from "./rpc";

import {
  CreateMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  GetSignAndSendCallbackParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetTokenBalanceMultisigParams,
  AppendToMultisigParams,
  RemoveFromMultisigParams,
  CreateSubtokenMultisigParams,
  SetSubtokenWeightMultisigParams,
  GetAssetWeightMultisigParams,
  SetPermissionMultisigParams,
} from "./types";

import { getSignAndSendCallback } from "./utils";

class Multisig {
  readonly api: ApiPromise;
  id: string;

  constructor({ api, id }: { api: ApiPromise; id?: string }) {
    if (!api.tx.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    if (!api.query.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    this.api = api;

    if (id && !Number.isNaN(parseInt(id))) {
      this.id = id;
    }
  }

  readonly isCreated = () => {
    if (this.id) return true;

    return false;
  };

  create = ({
    defaultAssetWeight = 0,
    defaultPermission = false,
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
                  data: [string, number, []];
                };
              };

              const ipsId = event.data[1].toString();

              if (!ipsId) {
                throw new Error("SOMETHING_WENT_SUPER_WRONG");
              }

              if (onSuccess) onSuccess(result);

              resolve(new Multisig({ api: this.api, id: ipsId }));
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
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getMultisig({ api: this.api, id: this.id });
  };

  createCall = ({
    ...params
  }: Omit<CreateMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createMultisigCall({ api: this.api, id: this.id, ...params });
  };

  getPendingCalls = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getPendingMultisigCalls({ api: this.api, id: this.id });
  };

  vote = ({ ...params }: Omit<VoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return voteMultisigCall({ api: this.api, id: this.id, ...params });
  };

  withdrawVote = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return withdrawVoteMultisigCall({ api: this.api, id: this.id, ...params });
  };

  mintToken = ({ ...params }: Omit<MintTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return mintToken({ api: this.api, id: this.id, ...params });
  };

  burnToken = ({ ...params }: Omit<BurnTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return burnToken({ api: this.api, id: this.id, ...params });
  };

  getTokenBalance = ({
    ...params
  }: Omit<GetTokenBalanceMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getTokenBalanceMultisig({ api: this.api, id: this.id, ...params });
  };

  getAllTokenBalances = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAllTokenBalancesMultisig({
      api: this.api,
      id: this.id,
    });
  };

  allowReplica = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return allowReplica({
      api: this.api,
      id: this.id,
    });
  };

  disallowReplica = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return disallowReplica({
      api: this.api,
      id: this.id,
    });
  };

  append = ({ ...params }: Omit<AppendToMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return append({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  remove = ({ ...params }: Omit<RemoveFromMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return remove({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  createSubtoken = ({
    ...params
  }: Omit<CreateSubtokenMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createSubtoken({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  setSubTokenWeight = ({
    ...params
  }: Omit<SetSubtokenWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return setSubtokenWeight({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  getAssetWeight = ({
    ...params
  }: Omit<GetAssetWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAssetWeight({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  setPermission = ({
    ...params
  }: Omit<SetPermissionMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return setPermission({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  disconnect = () => {
    this.api.disconnect();
  };
}

const MultisigTypes = {
  OneOrPercent: {
    _enum: {
      One: null,
      Percent: "Percent",
    },
  },
};

export { Multisig, MultisigTypes };
