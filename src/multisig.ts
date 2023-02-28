import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult, Signer } from "@polkadot/types/types";

import {
  createMultisig,
  createMultisigCall,
  getMultisig,
  getPendingMultisigCalls,
  getPendingMultisigCall,
  voteMultisigCall,
  withdrawVoteMultisigCall,
  mintTokenMultisig,
  burnTokenMultisig,
  getTokenBalanceMultisig,
  getAllTokenBalancesMultisig,
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
  GetPendingMultisigCallParams,
} from "./types";

import { getSignAndSendCallback } from "./utils";

class Multisig {
  readonly api: ApiPromise;
  readonly id: string;

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

  public readonly isCreated = () => {
    if (this.id) return true;

    return false;
  };

  public disconnect = () => {
    this.api.disconnect();
  };

  public create = ({
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

  public getDetails = async () => {
    const multisig = (await this._getMultisig()).toPrimitive() as {
      supply: number;
      metadata: string;
      defaultPermission: boolean;
      executionThreshold: OneOrPercent;
      defaultAssetWeight: OneOrPercent;
    };

    const details = {
      supply: multisig.supply,
      metadata: multisig.metadata,
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

  public getSupply = async () => {
    const { supply } = (await this._getMultisig()).toPrimitive() as {
      supply: number;
    };

    return supply;
  };

  public getBalance = async ({ address }: { address: string }) => {
    const balance = (
      await this._getTokenBalanceMultisig({
        address,
      })
    ).toPrimitive() as number;

    return balance;
  };

  public getPower = async ({ address }: { address: string }) => {
    const balance = await this.getBalance({ address });

    const supply = await this.getSupply();

    const power = (balance / supply) * 100;

    return power;
  };

  public getOpenCalls = async () => {
    const pendingCalls = await this._getPendingMultisigCalls();

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

  public getPendingCall = async ({ callHash }: { callHash: `0x${string}` }) => {
    const call = await this._getPendingMultisigCall({ callHash });

    const callDetails = call.toPrimitive() as {
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
  };

  public addMember = ({
    address,
    amount,
    token = null,
    metadata,
  }: {
    address: string;
    amount: number;
    token?: string;
    metadata?: string;
  }) => {
    const calls = [
      this._mintTokenMultisig({
        address,
        amount,
        token,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  public removeMember = async ({
    address,
    metadata,
  }: {
    address: string;
    metadata?: string;
  }) => {
    const balance = await this.getBalance({ address });

    const calls = [
      this._burnTokenMultisig({
        address,
        amount: balance,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  public vote = ({ callHash }: { callHash: `0x${string}` }) => {
    return this._voteMultisigCall({
      callHash,
    });
  };

  public withdrawVote = ({ callHash }: { callHash: `0x${string}` }) => {
    return this._withdrawVoteMultisigCall({
      callHash,
    });
  };

  public createCall = ({
    metadata,
    calls,
  }: {
    metadata?: string;
    calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
  }) => {
    return this._createMultisigCall({
      metadata,
      calls,
    });
  };

  public createRanking = async () => {
    const allTokenBalances = await this._getAllTokenBalancesMultisig();

    const ranking = allTokenBalances
      .map((tokenBalance) => {
        const amount = tokenBalance[1].toPrimitive() as number;

        const address = tokenBalance[0].args[1].toPrimitive() as string;

        return { address, amount };
      })
      .sort((a, b) => b.amount - a.amount);

    return ranking;
  };

  public computeVotes = async ({ callHash }: { callHash: `0x${string}` }) => {
    const pendingCalls = await this.getOpenCalls();
    const details = await this.getDetails();

    const call = pendingCalls.find((call) => call.callHash === callHash);

    if (!call) throw new Error("CALL_NOT_FOUND_OR_ALREADY_EXECUTED");

    let yes = 0;

    for (const signer of call.signers) {
      const power = await this.getPower({ address: signer });

      yes += power;
    }

    const voters = call.signers;

    const remaining = details.executionThreshold - yes;

    return {
      total: 100,
      yes,
      remaining,
      voters,
      executionThreshold: details.executionThreshold,
    };
  };

  private _getMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getMultisig({ api: this.api, id: this.id });
  };

  private _createMultisigCall = ({
    ...params
  }: Omit<CreateMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createMultisigCall({ api: this.api, ...params });
  };

  private _getPendingMultisigCalls = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getPendingMultisigCalls({ api: this.api, id: this.id });
  };

  private _getPendingMultisigCall = ({
    ...params
  }: Omit<GetPendingMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getPendingMultisigCall({ api: this.api, id: this.id, ...params });
  };

  private _voteMultisigCall = ({
    ...params
  }: Omit<VoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return voteMultisigCall({ api: this.api, ...params });
  };

  private _withdrawVoteMultisigCall = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return withdrawVoteMultisigCall({ api: this.api, ...params });
  };

  private _mintTokenMultisig = ({
    ...params
  }: Omit<MintTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return mintTokenMultisig({ api: this.api, ...params });
  };

  private _burnTokenMultisig = ({
    ...params
  }: Omit<BurnTokenMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return burnTokenMultisig({ api: this.api, ...params });
  };

  private _getTokenBalanceMultisig = ({
    ...params
  }: Omit<GetTokenBalanceMultisigParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getTokenBalanceMultisig({ api: this.api, ...params });
  };

  private _getAllTokenBalancesMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAllTokenBalancesMultisig({
      api: this.api,
    });
  };

  private _createSubTokenMultisig = ({
    ...params
  }: Omit<CreateSubTokenMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return createSubTokenMultisig({
      api: this.api,

      ...params,
    });
  };

  private _setSubTokenWeightMultisig = ({
    ...params
  }: Omit<SetSubTokenWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return setSubTokenWeightMultisig({
      api: this.api,

      ...params,
    });
  };

  private _getAssetWeightMultisig = ({
    ...params
  }: Omit<GetAssetWeightMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAssetWeightMultisig({
      api: this.api,

      ...params,
    });
  };

  private _getSubAssetMultisig = ({
    ...params
  }: Omit<GetSubAssetMultisigParams, "id" | "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getSubAssetMultisig({
      api: this.api,

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

const MultisigRuntime = {
  SaturnAccountDeriver: [
    {
      methods: {
        derive_account: {
          description: "Derive Saturn account",
          params: [
            {
              name: "core_id",
              type: "u32",
            },
          ],
          type: "AccountId32",
        },
      },
      version: 1,
    },
  ],
};

export { Multisig, MultisigTypes, MultisigRuntime };
