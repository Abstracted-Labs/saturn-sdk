import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { AccountId, DispatchResult, Call } from "@polkadot/types/interfaces";
import { ISubmittableResult, Signer } from "@polkadot/types/types";
import type { BN } from "@polkadot/util";
import { AnyJson } from "@polkadot/types-codec/types";

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
              ?.event.data.toPrimitive() as [string, number, string, BN, BN];

            const assetsEvent = events
              .find(
                ({ event }) =>
                  event.section === "coreAssets" && event.method === "Endowed"
              )
              ?.event.data.toPrimitive() as [string, string, BN];

            if (!event || !assetsEvent) {
              throw new Error("SOMETHING_WENT_WRONG");
            }

            resolve({
              id: event[1],
              account: event[0],
              metadata: event[2],
              minimumSupport: event[3],
              requiredApproval: event[4],
              creator: address,
              tokenSupply: assetsEvent[2],
            } as MultisigCreateResult);
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
    token = null,
    metadata,
  }: {
    id: string;
    address: string;
    amount: number;
    token?: string;
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
                  const args = event.data.toPrimitive() as [
                    number,
                    string,
                    string,
                    string,
                    Call,
                    DispatchResult
                  ];

                  const result: MultisigCallResult = {
                    executed: true,
                    result: {
                      id: args[0],
                      account: args[1],
                      voter: args[2],
                      callHash: args[3],
                      call: args[4],
                      executionResult: args[5],
                    },
                  };

                  resolve(result);

                  break;
                }
                case "MultisigVoteStarted": {
                  const args = event.data.toPrimitive() as [
                    number,
                    string,
                    string,
                    { aye: BN } | { nay: BN },
                    string,
                    Call
                  ];

                  const result: MultisigCallResult = {
                    executed: false,
                    result: {
                      id: args[0],
                      account: args[1],
                      voter: args[2],
                      votesAdded: args[3],
                      callHash: args[4],
                      call: args[5],
                    },
                  };

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
    feeAsset: string;
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
    asset: string;
    amount: BN;
    to: string;
    feeAsset: string;
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
    feeAsset: string;
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
    asset: string;
    amount: BN;
    to: string;
    feeAsset: string;
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
