import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult, Signer } from "@polkadot/types/types";

import {
  createCore,
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
  deriveMultisigAccount,
  transferExternalAssetMultisigCall,
} from "./rpc";
import { sendExternalMultisigCall } from "./rpc/sendExternalMultisigCall";

import {
  CreateMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  GetSignAndSendCallbackParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetTokenBalanceMultisigParams,
  GetPendingMultisigCallParams,
  DeriveMultisigAccountParams,
  SendExternalMultisigCallParams,
  TransferExternalAssetMultisigCallParams,
} from "./types";

import { getSignAndSendCallback } from "./utils";

const PARACHAINS_KEY = "TinkernetRuntimeRingsParachains";
const PARACHAINS_ASSETS = "TinkernetRuntimeRingsParachainAssets";

// const setupTypes = ({ api }: { api: ApiPromise }) => {
//   const parachainsTypeId = api.registry.getDefinition(PARACHAINS_KEY);
//   const parachainsAssetsTypeId = api.registry.getDefinition(PARACHAINS_ASSETS);

//   const parachainAssets = JSON.parse(
//     api.registry.lookup.getTypeDef(parachainsAssetsTypeId).type
//   );

//   const kt = api.registry.knownTypes;

//   kt.types = Object.assign(
//     {
//       Parachains: JSON.parse(
//         api.registry.lookup.getTypeDef(parachainsTypeId).type
//       ),
//       ParachainsAssets: parachainAssets,
//     },
//     kt.types
//   );

//   for (const key in parachainAssets._enum) {
//     const origValue = parachainAssets._enum[key];

//     const newValue = origValue.replace("TinkernetRuntimeRings", "");

//     parachainAssets._enum[key] = newValue;

//     const typ = api.registry.lookup.getTypeDef(
//       api.registry.getDefinition(origValue)
//     ).type;

//     kt.types = Object.assign(JSON.parse(`{"${newValue}": ${typ}}`), kt.types);
//   }

//   kt.types = Object.assign(
//     {
//       ParachainsAssets: parachainAssets,
//     },
//     kt.types
//   );

//   api.registry.setKnownTypes(kt);
// };

class Saturn {
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

    // setupTypes({ api });
  }

  public readonly isCreated = () => {
    if (this.id) return true;

    return false;
  };

  public disconnect = () => {
    this.api.disconnect();
  };

  public create = ({
    metadata,
    minimumSupport,
    requiredApproval,
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
    }): Promise<Saturn> => {
    return new Promise((resolve, reject) => {
      try {
        createCore({
          api: this.api,
          metadata,
          minimumSupport,
          requiredApproval,
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
                ({ event }) => event.method === "CoreCreated"
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

              resolve(new Saturn({ api: this.api, id: ipsId }));
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
      account: string;
      metadata: string;
      minimumSupport: number;
      requiredApproval: number;
      frozenTokens: boolean;
    };

    if (!multisig) throw new Error("MULTISIG_DOES_NOT_EXIST");

    return {
      account: multisig.account,
      metadata: multisig.metadata,
      minimumSupport: multisig.minimumSupport / 100,
      requiredApproval: multisig.requiredApproval / 100,
      frozenTokens: multisig.frozenTokens,
    };
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
      id: this.id,
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

    const call = pendingCalls.find((call) => call.callHash === callHash);

    if (!call) throw new Error("CALL_NOT_FOUND_OR_ALREADY_EXECUTED");

    let yes = 0;

    for (const signer of call.signers) {
      const power = await this.getPower({ address: signer });

      yes += power;
    }

    const voters = call.signers;

    return {
      total: 100,
      yes,
      voters,
    };
  };

  public deriveAccount = async ({ id }: { id: string }) => {
    const derivedAddress = await this._deriveMultisigAccount({
      id,
    });

    return derivedAddress;
  };

  public sendExternalCall = ({
    destination,
    weight,
    callData,
    metadata,
  }: {
    destination: string;
    weight: string;
    callData: `0x${string}`;
    metadata?: string;
  }) => {
    const calls = [
      this._sendExternalMultisigCall({
        destination,
        weight,
        callData,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  public transferExternalAssetCall = ({
    destination,
    asset,
    amount,
    to,
    metadata,
  }: {
    destination: string;
    asset: string;
    amount: string;
    to: string;
    metadata?: string;
  }) => {
    const calls = [
      this._transferExternalAssetMultisigCall({
        destination,
        asset,
        amount,
        to,
      }),
    ];

    return this.createCall({ calls, metadata });
  };

  // public getExternalAssets = () => {
  //   const {
  //     types: {
  //       // TODO fix this
  //       // @ts-ignore
  //       ParachainsAssets: { _enum: parachains },
  //     },
  //   } = this.api.registry.knownTypes;

  //   let assets = {};

  //   for (const key in parachains) {
  //     // TODO fix this
  //     // @ts-ignore
  //     assets[key] = types[parachains[key]]._enum;
  //   }

  //   return assets;
  // };

  // public getParachains = () => {
  //   const {
  //     types: {
  //       // TODO fix this
  //       // @ts-ignore
  //       ParachainsAssets: { _enum: parachains },
  //     },
  //   } = this.api.registry.knownTypes;

  //   const names = Object.keys(parachains);

  //   return names;
  // };

  private _getMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getMultisig({ api: this.api, id: this.id });
  };

  private _createMultisigCall = ({
    ...params
  }: Omit<CreateMultisigCallParams, "api">) => {
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
  }: Omit<VoteMultisigCallParams, "api">) => {
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
  }: Omit<MintTokenMultisigParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return mintTokenMultisig({ api: this.api, ...params });
  };

  private _burnTokenMultisig = ({
    ...params
  }: Omit<BurnTokenMultisigParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return burnTokenMultisig({ api: this.api, ...params });
  };

  private _getTokenBalanceMultisig = ({
    ...params
  }: Omit<GetTokenBalanceMultisigParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getTokenBalanceMultisig({ api: this.api, ...params });
  };

  private _getAllTokenBalancesMultisig = () => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return getAllTokenBalancesMultisig({
      api: this.api,
    });
  };

  private _deriveMultisigAccount = ({
    ...params
  }: Omit<DeriveMultisigAccountParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return deriveMultisigAccount({
      api: this.api,
      ...params,
    });
  };

  private _sendExternalMultisigCall = ({
    ...params
  }: Omit<SendExternalMultisigCallParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return sendExternalMultisigCall({
      api: this.api,
      ...params,
    });
  };

  private _transferExternalAssetMultisigCall = ({
    destination,
    ...params
  }: Omit<TransferExternalAssetMultisigCallParams, "api">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");
    const {
      types: {
        // TODO fix this
        // @ts-ignore
        ParachainsAssets: { _enum: parachains },
      },
    } = this.api.registry.knownTypes;

    const realDestination = parachains[destination];

    return transferExternalAssetMultisigCall({
      api: this.api,
      destination: realDestination,
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

export { Saturn, MultisigTypes, MultisigRuntime };
