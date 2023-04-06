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
} from "./types";

import { getSignAndSendCallback } from "./utils";

const PARACHAINS_KEY = "TinkernetRuntimeRingsChains";
const PARACHAINS_ASSETS = "TinkernetRuntimeRingsChainAssets";

const setupTypes = ({ api }: { api: ApiPromise }) => {
  const parachainsTypeId = api.registry.getDefinition(
    PARACHAINS_KEY
  ) as `Lookup${number}`;

  const parachainsAssetsTypeId = api.registry.getDefinition(
    PARACHAINS_ASSETS
  ) as `Lookup${number}`;

  const parachainAssets = JSON.parse(
    api.registry.lookup.getTypeDef(parachainsAssetsTypeId).type
  );

  const kt = api.registry.knownTypes;

  kt.types = Object.assign(
    {
      Parachains: JSON.parse(
        api.registry.lookup.getTypeDef(parachainsTypeId).type
      ),
      ParachainsAssets: parachainAssets,
    },
    kt.types
  );

  for (const key in parachainAssets._enum) {
    const origValue = parachainAssets._enum[key];

    const newValue = origValue.replace("TinkernetRuntimeRings", "");

    parachainAssets._enum[key] = newValue;

    const typ = api.registry.lookup.getTypeDef(
      api.registry.getDefinition(origValue) as any
    ).type;

    kt.types = Object.assign(JSON.parse(`{"${newValue}": ${typ}}`), kt.types);
  }

  kt.types = Object.assign(
    {
      ParachainsAssets: parachainAssets,
    },
    kt.types
  );

  api.registry.setKnownTypes(kt);
};

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

    setupTypes({ api });
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
    }): Promise<Multisig> => {
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

  public vote = ({
    callHash,
    aye,
  }: {
    callHash: `0x${string}`;
    aye: boolean;
  }) => {
    return this._voteMultisigCall({
      callHash,
      aye,
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
  }: Omit<VoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return voteMultisigCall({ api: this.api, id: this.id, ...params });
  };

  private _withdrawVoteMultisigCall = ({
    ...params
  }: Omit<WithdrawVoteMultisigCallParams, "api" | "id">) => {
    if (!this.isCreated()) throw new Error("MULTISIG_NOT_CREATED_YET");

    return withdrawVoteMultisigCall({ api: this.api, id: this.id, ...params });
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

export { Multisig, MultisigTypes, MultisigRuntime };
