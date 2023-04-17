import "../typegen";
import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { AccountId, DispatchResult, Call, Hash, Perbill, Balance } from "@polkadot/types/interfaces";
import { ISubmittableResult, Signer } from "@polkadot/types/types";
import type { BN } from "@polkadot/util";
import { AnyJson } from "@polkadot/types-codec/types";
import { u32 } from "@polkadot/types-codec/primitive";
import { Text } from "@polkadot/types-codec/native";

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
  transferExternalAssetMultisigCall,
  sendExternalMultisigCall,
  getMultisigsForAccount,
  getMultisigMembers,
  bridgeExternalMultisigAssetCall,
} from "./rpc";

import {
  CreateMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  GetSignAndSendCallbackParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetPendingMultisigCallParams,
  SendExternalMultisigCallParams,
  TransferExternalAssetMultisigCallParams,
  MultisigCreateResult,
  ApiAndId,
  GetMultisigsForAccountParams,
  CallDetails,
  MultisigCallResult,
    VotesAdded,
} from "./types";

import { getSignAndSendCallback } from "./utils";

const PARACHAINS_KEY = "TinkernetRuntimeRingsChains";
const PARACHAINS_ASSETS = "TinkernetRuntimeRingsChainAssets";

const setupTypes = ({
  api,
}: {
  api: ApiPromise;
}): {
  chain: string;
  assets: {
    label: string;
    registerType: Object;
  }[];
}[] => {
  const parachainsTypeId = api.registry.getDefinition(
    PARACHAINS_KEY
  ) as `Lookup${number}`;

  const parachainsAssetsTypeId = api.registry.getDefinition(
    PARACHAINS_ASSETS
  ) as `Lookup${number}`;

  const parachainAssets = JSON.parse(
    api.registry.lookup.getTypeDef(parachainsAssetsTypeId).type
  );

  const chainsEnum = JSON.parse(
    api.registry.lookup.getTypeDef(parachainsTypeId).type
  );

  const kt = api.registry.knownTypes;

  kt.types = Object.assign(
    {
      Parachains: chainsEnum,
      ParachainsAssets: parachainAssets,
    },
    kt.types
  );

  let chains = [];

  for (const i in chainsEnum._enum) {
    const key = chainsEnum._enum[i];

    const newValue = "TinkernetRuntimeRings" + key + key + "Assets";

    parachainAssets._enum[key] = newValue;

    const typ = api.registry.lookup.getTypeDef(
      api.registry.getDefinition(newValue) as any
    ).type;

    kt.types = Object.assign(JSON.parse(`{"${newValue}": ${typ}}`), kt.types);

    const assets = (
      Array.isArray(JSON.parse(typ)._enum)
        ? JSON.parse(typ)._enum
        : Object.keys(JSON.parse(typ)._enum)
    )
      .filter((item: string) => item != "Custom")
      .map((item: string) => ({
        label: item,
        registerType: JSON.parse(`{"${key}": "${item}"}`),
      }));

    chains.push({ chain: key, assets });
  }

  kt.types = Object.assign(
    {
      ParachainsAssets: parachainAssets,
    },
    kt.types
  );

  api.registry.setKnownTypes(kt);

  return chains;
};

class Saturn {
  readonly api: ApiPromise;
  readonly chains: {
    chain: string;
    assets: {
      label: string;
      registerType: Object;
    }[];
  }[];

  address: string;
  signer: Signer;

  constructor({
    api,
    address,
    signer,
  }: {
    api: ApiPromise;
    address: string;
    signer: Signer;
  }) {
    if (!api.tx.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    if (!api.query.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    this.api = api;
    this.chains = setupTypes({ api });
    this.address = address;
    this.signer = signer;
  }

  public setAddress = (address: string) => {
    this.address = address;
  };

  public setSigner = (signer: Signer) => {
    this.signer = signer;
  };

  public disconnect = () => {
    this.api.disconnect();
  };

  public create = async ({
    metadata,
    minimumSupport,
    requiredApproval,
    address,
    signer,
  }: Omit<CreateMultisigParams, "api"> &
    GetSignAndSendCallbackParams & {
      address: string;
      signer: Signer;
    }): Promise<MultisigCreateResult> => {
    return new Promise((resolve, reject) => {
      try {
        createCore({
          api: this.api,
          metadata,
          minimumSupport,
          requiredApproval,
        }).signAndSend(address, { signer }, ({ events, status }) => {
          if (status.isInBlock) {
            const event = events
              .find(({ event }) => event.method === "CoreCreated")
              ?.event.data;

            const assetsEvent = events
              .find(
                ({ event }) =>
                  event.section === "coreAssets" && event.method === "Endowed"
              )
              ?.event.data;

            if (!event || !assetsEvent) {
              throw new Error("SOMETHING_WENT_WRONG");
            }

              const result = new MultisigCreateResult({
                  id: event[1] as u32,
                  account: event[0] as AccountId,
                  metadata: event[2] as Text,
                  minimumSupport: event[3] as Perbill,
                  requiredApproval: event[4] as Perbill,
                  creator: this.api.createType("AccountId", address),
                  tokenSupply: assetsEvent[2] as Balance,
              });

            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  public getDetails = async (id: string) => {
    const multisig = (await this._getMultisig(id)).toPrimitive() as {
      account: string;
      metadata: string;
      minimumSupport: number;
      requiredApproval: number;
      frozenTokens: boolean;
    };

    if (!multisig) throw new Error("MULTISIG_DOES_NOT_EXIST");

    return {
      id,
      account: multisig.account,
      metadata: multisig.metadata,
      minimumSupport: multisig.minimumSupport / 100,
      requiredApproval: multisig.requiredApproval / 100,
      frozenTokens: multisig.frozenTokens,
    };
  };

  public getSupply = async (id: string) => {
    const { supply } = (await this._getMultisig(id)).toPrimitive() as {
      supply: number;
    };

    return supply;
  };

  public getOpenCalls = async (id: string) => {
    const pendingCalls = await this._getPendingMultisigCalls(id);

    const openCalls = pendingCalls.map((call) => {
      const callHash = call[0].args[1].toHex() as string;

      const callDetails = call[1].toPrimitive() as unknown as {
        tally: {
          ayes: BN;
          nays: BN;
          records: Record<string, Record<"aye" | "nay", BN>>;
        };
        originalCaller: string;
        actualCall: Call;
        metadata: string | null;
      };

      return {
        callHash,
        tally: callDetails.tally,
        originalCaller: callDetails.originalCaller,
        actualCall: callDetails.actualCall,
        metadata: callDetails.metadata,
      };
    });

    return openCalls;
  };

  public getPendingCall = async ({
    id,
    callHash,
  }: {
    id: string;
    callHash: string;
  }) => {
    const call = await this._getPendingMultisigCall({ id, callHash });

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

  public getMultisigMembers = async (id: string): Promise<AccountId[]> => {
    const keys = await this._getMultisigMembers({ id });

    const mapped = keys.map(
      ({ args: [coreId, member] }) =>
        member.toPrimitive() as unknown as AccountId
    );

    return mapped;
  };

  public getMultisigsForAccount = async (
    account: string
  ): Promise<{ multisigId: string; tokens: BN }[]> => {
    const entries = await this._getMultisigsForAccount({ account });

    const mapped = entries.map(
      ([
        {
          args: [account, coreId],
        },
        tokens,
      ]) => {
        const id = coreId.toPrimitive() as string;
        const free = (tokens.toPrimitive() as unknown as { free: BN }).free;
        return { multisigId: id, tokens: free };
      }
    );

    return mapped;
  };

  public proposeNewMember = ({
    id,
    address,
    amount,
    metadata,
  }: {
    id: string;
    address: string;
    amount: number;
    metadata?: string;
  }) => {
    return this.proposeMultisigCall({
      id,
      call: this._mintTokenMultisig({
        address,
        amount,
      }),
      metadata,
    });
  };

  public proposeMemberRemoval = async ({
    id,
    address,
    amount,
    metadata,
  }: {
    id: string;
    address: string;
    amount: number;
    metadata?: string;
  }) => {
    return this.proposeMultisigCall({
      id,
      call: this._burnTokenMultisig({
        address,
        amount,
      }),
      metadata,
    });
  };

  public vote = ({
    id,
    callHash,
    aye,
  }: {
    id: string;
    callHash: `0x${string}`;
    aye: boolean;
  }) => {
    return this._voteMultisigCall({
      id,
      callHash,
      aye,
    });
  };

  public withdrawVote = ({
    id,
    callHash,
  }: {
    id: string;
    callHash: `0x${string}`;
  }) => {
    return this._withdrawVoteMultisigCall({
      id,
      callHash,
    });
  };

  public proposeMultisigCall = async ({
    id,
    metadata,
    call,
  }: {
    id: string;
    metadata?: string;
    call: SubmittableExtrinsic<"promise", ISubmittableResult>;
  }): Promise<MultisigCallResult> => {
    return new Promise((resolve, reject) => {
      try {
        this._createMultisigCall({
          id,
          metadata,
          call,
        }).signAndSend(
          this.address,
          { signer: this.signer },
          ({ events, status }) => {
            if (status.isInBlock) {
              const event = events.find(
                ({ event }) =>
                  event.method == "MultisigExecuted" ||
                  event.method == "MultisigVoteStarted"
              )?.event;

              if (!event) {
                throw new Error("SOMETHING_WENT_WRONG");
              }

              const method = event.method;

              switch (method) {
                case "MultisigExecuted": {

                    console.log("event typ: ", event.typeDef);

                    console.log("as Call: ", event.data[4] as Call);
                    const test = this.api.createType('Call', event.data[4]);
                    console.log("test: ", test);

                    const args = event.data;

                    const result = new MultisigCallResult({
                    isExecuted: true,
                        isVoteStarted: false,
                      id: args[0] as u32,
                      account: args[1] as AccountId,
                      voter: args[2] as AccountId,
                      callHash: args[3] as Hash,
                      call: args[4] as Call,
                      executionResult: args[5] as DispatchResult,
                    });

                    console.log("result: ", result);

                  resolve(result);

                  break;
                }
                case "MultisigVoteStarted": {
                    const args = event.data;

                    const result = new MultisigCallResult({
                    isVoteStarted: true,
                        isExecuted: false,
                      id: args[0] as u32,
                      account: args[1] as AccountId,
                      voter: args[2] as AccountId,
                          votesAdded: args[3] as VotesAdded,
                      callHash: args[4] as Hash,
                      call: args[5] as Call,
                    });

                    console.log("result: ", result);

                  resolve(result);

                  break;
                }
                default:
                  break;
              }
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  };

  public sendXCMCall = ({
    id,
    destination,
    weight,
    callData,
    feeAsset,
    fee,
    metadata,
  }: {
    id: string;
    destination: string;
    weight: BN;
    callData: string;
    feeAsset: Object;
    fee: BN;
    metadata?: string;
  }) => {
    const call = this._sendExternalMultisigCall({
      destination,
      weight,
      callData,
      feeAsset,
      fee,
    });

    return this.proposeMultisigCall({ id, call, metadata });
  };

  public transferXcmAsset = ({
    id,
    asset,
    amount,
    to,
    feeAsset,
    fee,
    metadata,
  }: {
    id: string;
    asset: Object;
    amount: BN;
    to: string;
    feeAsset: Object;
    fee: BN;
    metadata?: string;
  }) => {
    const call = this._transferExternalAssetMultisigCall({
      asset,
      amount,
      to,
      feeAsset,
      fee,
    });

    return this.proposeMultisigCall({ id, call, metadata });
  };

  public getExternalAssets = () => {
    const { types } = this.api.registry.knownTypes;

    // TODO fix this
    // @ts-ignore
    const parachains = types.ParachainsAssets._enum;

    let assets = {};

    for (const key in parachains) {
      // TODO fix this
      // @ts-ignore
      assets[key] = types[parachains[key]]._enum;
    }

    return assets;
  };

  public getParachains = () => {
    const { types } = this.api.registry.knownTypes;

    // TODO fix this
    // @ts-ignore
    const parachains = types.ParachainsAssets._enum;

    const names = Object.keys(parachains);

    return names;
  };

  private _getMultisig = (id: string) => {
    return getMultisig({ api: this.api, id });
  };

  private _createMultisigCall = ({
    id,
    metadata,
    call,
  }: {
    id: string;
    metadata?: string;
    call: SubmittableExtrinsic<"promise", ISubmittableResult>;
  }) => {
    return createMultisigCall({ api: this.api, id, metadata, call });
  };

  private _getPendingMultisigCalls = (id: string) => {
    return getPendingMultisigCalls({ api: this.api, id });
  };

  private _getPendingMultisigCall = ({
    id,
    callHash,
  }: {
    id: string;
    callHash: string;
  }) => {
    return getPendingMultisigCall({ api: this.api, id, callHash });
  };

  private _getMultisigMembers = ({ id }: { id: string }) => {
    return getMultisigMembers({ api: this.api, id });
  };

  private _getMultisigsForAccount = ({ account }: { account: string }) => {
    return getMultisigsForAccount({ api: this.api, account });
  };

  private _voteMultisigCall = ({
    id,
    callHash,
    aye,
  }: {
    id: string;
    callHash: string;
    aye: boolean;
  }) => {
    return voteMultisigCall({ api: this.api, id, callHash, aye });
  };

  private _withdrawVoteMultisigCall = ({
    id,
    callHash,
  }: {
    id: string;
    callHash: string;
  }) => {
    return withdrawVoteMultisigCall({ api: this.api, id, callHash });
  };

  private _mintTokenMultisig = ({
    ...params
  }: Omit<MintTokenMultisigParams, "api">) => {
    return mintTokenMultisig({ api: this.api, ...params });
  };

  private _burnTokenMultisig = ({
    ...params
  }: Omit<BurnTokenMultisigParams, "api">) => {
    return burnTokenMultisig({ api: this.api, ...params });
  };

  private _sendExternalMultisigCall = ({
    destination,
    weight,
    callData,
    feeAsset,
    fee,
  }: {
    destination: string;
    weight: BN;
    callData: string;
    feeAsset: Object;
    fee: BN;
  }) => {
    return sendExternalMultisigCall({
      api: this.api,
      destination,
      weight,
      callData,
      feeAsset,
      fee,
    });
  };

  private _transferExternalAssetMultisigCall = ({
    asset,
    amount,
    to,
    feeAsset,
    fee,
  }: {
    asset: Object;
    amount: BN;
    to: string;
    feeAsset: Object;
    fee: BN;
  }) => {
    return transferExternalAssetMultisigCall({
      api: this.api,
      asset,
      amount,
      to,
      feeAsset,
      fee,
    });
  };

  private _bridgeExternalMultisigAssetCall = ({
    asset,
    destination,
    fee,
    amount,
    to,
  }: {
    asset: string;
    destination: string;
    fee: BN;
    amount: BN;
    to: string;
  }) => {
    return bridgeExternalMultisigAssetCall({
      api: this.api,
      asset,
      destination,
      fee,
      amount,
      to,
    });
  };
}

export { Saturn };
