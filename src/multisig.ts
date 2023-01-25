import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult, Signer } from "@polkadot/types/types";

import {
  createMultisig,
  createMultisigCall,
  getMultisig,
  getPendingMultisigCalls,
  voteMultisigCall,
  withdrawVoteMultisigCall,
  mintTokenMultisig,
  burnTokenMultisig,
  getTokenBalanceMultisig,
  getAllTokenBalancesMultisig,
  allowReplicaMultisig,
  disallowReplicaMultisig,
  createSubTokenMultisig,
  setSubTokenWeightMultisig,
  getAssetWeightMultisig,
  getSubAssetMultisig,
} from "./rpc";

import {
  OneOrPercent,
  CreateMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  GetSignAndSendCallbackParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetTokenBalanceMultisigParams,
  CreateSubTokenMultisigParams,
  SetSubTokenWeightMultisigParams,
  GetAssetWeightMultisigParams,
  GetSubAssetMultisigParams,
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

  disconnect = () => {
    this.api.disconnect();
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

  getDetails = async () => {
    const multisig = (await this.getMultisig()).toPrimitive() as {
      supply: number;
      metadata: string;
      allowReplica: boolean;
      defaultPermission: boolean;
      executionThreshold: OneOrPercent;
      defaultAssetWeight: OneOrPercent;
    };

    const details = {
      supply: multisig.supply,
      metadata: multisig.metadata,
      allowReplica: multisig.allowReplica,
      defaultPermission: multisig.defaultPermission,
      executionThreshold: multisig.executionThreshold.one
        ? 100
        : multisig.executionThreshold.zeroPoint,
      defaultAssetWeight: multisig.defaultAssetWeight.one
        ? 100
        : multisig.defaultAssetWeight.zeroPoint,
    };

    return details;
  };

  getSupply = async () => {
    const { supply } = (await this.getMultisig()).toPrimitive() as {
      supply: number;
    };

    return supply;
  };

  getBalance = async ({ address }: { address: string }) => {
    const balance = (
      await getTokenBalanceMultisig({
        api: this.api,
        id: this.id,
        address,
      })
    ).toPrimitive() as number;

    return balance;
  };

  getPower = async ({ address }: { address: string }) => {
    const balance = await this.getBalance({ address });

    const supply = await this.getSupply();

    const power = (balance / supply) * 100;

    return power;
  };

  getOpenCalls = async () => {
    const pendingCalls = await this.getPendingMultisigCalls();

    const openCalls = pendingCalls.map((call) => {
      const callHash = call[0].args[1].toHex() as string;

      const callDetails = call[1].toPrimitive() as {
        signers: [string, null][];
        originalCaller: string;
        actualCall: string;
        callMetadata: string;
        callWeight: number;
        metadata?: string;
      };

      return {
        callHash,
        signers: callDetails.signers.map((signer) => signer[0]),
        originalCaller: callDetails.originalCaller,
        actualCall: callDetails.actualCall,
        callMetadata: callDetails.callMetadata,
        callWeight: callDetails.callWeight,
        metadata: callDetails.metadata,
      };
    });

    return openCalls;
  };

  addMember = ({
    address,
    amount,
    metadata,
  }: {
    address: string;
    amount: number;
    metadata?: string;
  }) => {
    const calls = [
      this.mintTokenMultisig({
        address,
        amount,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  removeMember = async ({
    address,
    metadata,
  }: {
    address: string;
    metadata?: string;
  }) => {
    const balance = await this.getBalance({ address });

    const calls = [
      this.burnTokenMultisig({
        address,
        amount: balance,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  vote = ({ callHash }: { callHash: `0x${string}` }) => {
    return this.voteMultisigCall({
      callHash,
    });
  };

  withdrawVote = ({ callHash }: { callHash: `0x${string}` }) => {
    return this.withdrawVoteMultisigCall({
      callHash,
    });
  };

  createCall = ({
    metadata,
    calls,
  }: {
    metadata?: string;
    calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
  }) => {
    return this.createMultisigCall({
      metadata,
      calls,
    });
  };

  createRanking = async () => {
    const allTokenBalances = await this.getAllTokenBalancesMultisig();

    const ranking = allTokenBalances
      .map((tokenBalance) => {
        const amount = tokenBalance[1].toPrimitive() as number;

        const address = tokenBalance[0].args[1].toPrimitive() as string;

        return { address, amount };
      })
      .sort((a, b) => b.amount - a.amount)
      .map((rank, index) => ({
        ...rank,
        position: index + 1,
      }));

    return ranking;
  };

  computeVotes = async ({ callHash }: { callHash: `0x${string}` }) => {
    const pendingCalls = await this.getOpenCalls();

    const call = pendingCalls.find((call) => call.callHash === callHash);

    if (!call) throw new Error("CALL_NOT_FOUND_OR_ALREADY_EXECUTED");

    let yes = 0;

    for (const signer of call.signers) {
      const power = await this.getPower({ address: signer });

      yes += power;
    }

    const voters = call.signers;

    const remaining = 100 - yes;

    return {
      total: 100,
      yes,
      remaining,
      voters,
    };
  };

  private getMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getMultisig({ api: this.api, id: this.id });
  };

  private createMultisigCall = ({
    ...params
  }: Omit<CreateMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createMultisigCall({ api: this.api, id: this.id, ...params });
  };

  private getPendingMultisigCalls = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getPendingMultisigCalls({ api: this.api, id: this.id });
  };

  private voteMultisigCall = ({
    ...params
  }: Omit<VoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return voteMultisigCall({ api: this.api, id: this.id, ...params });
  };

  private withdrawVoteMultisigCall = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return withdrawVoteMultisigCall({ api: this.api, id: this.id, ...params });
  };

  private mintTokenMultisig = ({
    ...params
  }: Omit<MintTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return mintTokenMultisig({ api: this.api, id: this.id, ...params });
  };

  private burnTokenMultisig = ({
    ...params
  }: Omit<BurnTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return burnTokenMultisig({ api: this.api, id: this.id, ...params });
  };

  private getTokenBalanceMultisig = ({
    ...params
  }: Omit<GetTokenBalanceMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getTokenBalanceMultisig({ api: this.api, id: this.id, ...params });
  };

  private getAllTokenBalancesMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAllTokenBalancesMultisig({
      api: this.api,
      id: this.id,
    });
  };

  private allowReplicaMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return allowReplicaMultisig({
      api: this.api,
      id: this.id,
    });
  };

  private disallowReplicaMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return disallowReplicaMultisig({
      api: this.api,
      id: this.id,
    });
  };

  private createSubTokenMultisig = ({
    ...params
  }: Omit<CreateSubTokenMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createSubTokenMultisig({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  private setSubTokenWeightMultisig = ({
    ...params
  }: Omit<SetSubTokenWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return setSubTokenWeightMultisig({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  private getAssetWeightMultisig = ({
    ...params
  }: Omit<GetAssetWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAssetWeightMultisig({
      api: this.api,
      id: this.id,
      ...params,
    });
  };

  private getSubAssetMultisig = ({
    ...params
  }: Omit<GetSubAssetMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getSubAssetMultisig({
      api: this.api,
      id: this.id,
      ...params,
    });
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
