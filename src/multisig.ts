import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, Call, GenericCall } from "@polkadot/api/types";
import { ISubmittableResult, Signer, DispatchResult } from "@polkadot/types/types";

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
} from "./types";

import { getSignAndSendCallback } from "./utils";

const PARACHAINS_KEY = "TinkernetRuntimeRingsChains";
const PARACHAINS_ASSETS = "TinkernetRuntimeRingsChainAssets";

const setupTypes = ({ api }: { api: ApiPromise }): {
        chain: string,
        assets: {
            label: string,
            registerType: Object,
        }[]
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

  const chainsEnum = JSON.parse(api.registry.lookup.getTypeDef(parachainsTypeId).type);

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

        const assets = (Array.isArray(JSON.parse(typ)._enum) ? JSON.parse(typ)._enum : Object.keys(JSON.parse(typ)._enum))
                           .filter(item => item != "Custom")
                           .map(item => ({ label: item, registerType: JSON.parse(`{"${key}": "${item}"}`) }));

        chains.push({ chain: key, assets });
    }

  kt.types = Object.assign(
    {
      ParachainsAssets: parachainAssets,
    },
    kt.types
  );

  api.registry.setKnownTypes(kt);

  return chains
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

    constructor({ api, address, signer }: { api: ApiPromise; address: string; signer: Signer }) {
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
    }

    public setSigner = (signer: Signer) => {
        this.signer = signer;
    }

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
        }).signAndSend(
          address,
          { signer },
            ({ events, status }) => {
                if (status.isInBlock) {
              const event = events.find(
                ({ event }) => event.method === "CoreCreated"
              ).event.data.toPrimitive() as [string, number, string, BN, BN];

                const assetsEvent = events.find(
                    ({ event }) => event.section === "coreAssets" && event.method === "Endowed"
                ).event.data.toPrimitive() as [string, string, BN];

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
                    tokenSuply: assetsEvent[2],
                    } as MultisigCreateEvent);
            }
            }
        )} catch (e) {
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

    public getPendingCall = async ({ id, callHash }: { id: string; callHash: `0x${string}` }) => {
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

    public withdrawVote = ({ id, callHash }: { id: string; callHash: `0x${string}` }) => {
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
                  ({ event }) => event.method == "MultisigExecuted" || event.method == "MultisigVoteStarted"
              ).event;

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
                                  GenericCall,
                                  DispatchResult,
                              ];

                              const result: MultisigCallResult = {
                                  executed: true,
                                  result: {
                                      id: args[0],
                                      account: args[1],
                                      voter: args[2],
                                      callHash: args[3],
                                      call: args[4],
                                      executionResult: args[5]
                                  }
                              };

                              resolve(result);

                              break;
                          };
                          case "MultisigVoteStarted": {
                              const args = event.data.toPrimitive() as [
                                  number,
                                  string,
                                  string,
                                  {aye: BN} | {nay: BN},
                                  string,
                                  GenericCall
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
                                  }
                              };

                              resolve(result);

                              break;
                          };
                          default: break;
                      }
                }
            }
        )} catch (e) {
            reject(e);
        }
      });
  };

  public sendXcmCall = ({
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
    weight: string;
    callData: `0x${string}`;
    feeAsset: string;
    fee: string;
    metadata?: string;
  }) => {
    const call = this._sendExternalMultisigCall({
        destination,
        weight,
        callData,
        feeAsset,
        fee,
      });

      return this.createCall({ id, call, metadata });
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
    amount: string;
    to: string;
    feeAsset: string,
    fee: string,
    metadata?: string;
  }) => {
    const call = this._transferExternalAssetMultisigCall({
        asset,
        amount,
        to,
        feeAsset,
        fee
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
    ...params
  }: Omit<CreateMultisigCallParams, "api">) => {
    return createMultisigCall({ api: this.api, ...params });
  };

    private _getPendingMultisigCalls = (id: string) => {
        return getPendingMultisigCalls({ api: this.api, id });
  };

    private _getPendingMultisigCall = ({
    ...params
  }: Omit<GetPendingMultisigCallParams, "api" | "id">) => {
      return getPendingMultisigCall({ api: this.api, ...params });
  };

  private _voteMultisigCall = ({
    ...params
  }: Omit<VoteMultisigCallParams, "api" | "id">) => {
      return voteMultisigCall({ api: this.api, ...params });
  };

  private _withdrawVoteMultisigCall = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api" | "id">) => {
      return withdrawVoteMultisigCall({ api: this.api, ...params });
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
    ...params
  }: Omit<SendExternalMultisigCallParams, "api">) => {
    return sendExternalMultisigCall({
      api: this.api,
      ...params,
    });
  };

  private _transferExternalAssetMultisigCall = ({
    destination,
    ...params
  }: Omit<TransferExternalAssetMultisigCallParams, "api">) => {
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

export { Saturn };
