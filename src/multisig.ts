import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import { AccountId, Call, Hash, Perbill } from "@polkadot/types/interfaces";
import type { BN } from "@polkadot/util";
import { u32 } from "@polkadot/types-codec/primitive";
import { Option } from "@polkadot/types-codec";
import { PalletInv4MultisigMultisigOperation } from "@polkadot/types/lookup";

import "./typegen/augment-api";
import "./typegen/augment-types";

import {
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
  getAccountAssets,
  getMultisigMembers,
  bridgeExternalMultisigAssetCall,
  getTotalIssuance,
  getMemberBalance,
  getChainsUnderMaintenance,
  setParameters,
} from "./rpc";

import {
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  MultisigCall,
  MultisigDetails,
  MultisigCreator,
  CallDetails,
  CallDetailsWithHash,
  FeeAsset,
  XcmAssetRepresentation,
  ParsedCallDetails,
} from "./types";

import { StorageKey } from "@polkadot/types";
import { XcmV3MultiLocation } from "@polkadot/types/lookup";
import { evmAccountFromMultisigId, relayAccountFromMultisigId } from "./utils";

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
    registerType: XcmAssetRepresentation;
  }[];
}[] => {
  const parachainsTypeId = api.registry.getDefinition(
    PARACHAINS_KEY
  ) as `Lookup${ number }`;

  const parachainsAssetsTypeId = api.registry.getDefinition(
    PARACHAINS_ASSETS
  ) as `Lookup${ number }`;

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

    kt.types = Object.assign(JSON.parse(`{"${ newValue }": ${ typ }}`), kt.types);

    const assets = (
      Array.isArray(JSON.parse(typ)._enum)
        ? JSON.parse(typ)._enum
        : Object.keys(JSON.parse(typ)._enum)
    )
      .filter((item: string) => item != "Custom")
      .map((item: string) => ({
        label: item,
        registerType: JSON.parse(`{"${ key }": "${ item }"}`),
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
      registerType: XcmAssetRepresentation;
    }[];
  }[];
  feeAsset: FeeAsset;

  private paraId: number;

  constructor({ api }: { api: ApiPromise; }) {
    if (!api.tx.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    if (!api.query.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    this.api = api;
    this.chains = setupTypes({ api });
    this.feeAsset = FeeAsset.Native;

    this.paraId =
      api.runtimeChain.toString() == "InvArch Tinker Network" ? 2125 : 3340;
  }

  public setFeeAsset = (feeAsset: FeeAsset) => {
    this.feeAsset = feeAsset;
  };

  public disconnect = () => {
    this.api.disconnect();
  };

  public createMultisig = ({
    metadata,
    minimumSupport,
    requiredApproval,
    creationFeeAsset,
  }: {
    metadata?: string | Uint8Array;
    minimumSupport: Perbill | BN | number;
    requiredApproval: Perbill | BN | number;
    creationFeeAsset: FeeAsset;
  }): MultisigCreator => {
    const creator = new MultisigCreator({
      api: this.api,
      feeAsset: this.feeAsset,
      metadata,
      minimumSupport,
      requiredApproval,
      creationFeeAsset,
    });

    return creator;
  };

  public getDetails = async (id: number): Promise<MultisigDetails | null> => {
    const multisig = (await this._getMultisig(id)).unwrap();

    if (!multisig) throw new Error("MULTISIG_DOES_NOT_EXIST");

    const totalIssuance: BN = await this._getTotalIssuance(id);

    const details = new MultisigDetails({
      id,
      parachainAccount: multisig.account,
      relayAccount: relayAccountFromMultisigId(this.paraId, id),
      evmAccount: evmAccountFromMultisigId(this.paraId, id),
      metadata: multisig.metadata.toString(),
      minimumSupport: multisig.minimumSupport,
      requiredApproval: multisig.requiredApproval,
      frozenTokens: multisig.frozenTokens.toHuman(),
      totalIssuance,
    });

    return details;
  };

  public getSupply = async (id: number) => {
    const supply: BN = await this._getTotalIssuance(id);

    return supply;
  };

  public getPendingCalls = async (
    id: number
  ): Promise<CallDetailsWithHash[]> => {
    try {
      const pendingCalls: [
        StorageKey<[u32, Hash]>,
        PalletInv4MultisigMultisigOperation
      ][] = await this._getPendingMultisigCalls(id);

      const oc = pendingCalls.map(([hash, call]) => {
        const c = call.toPrimitive() as unknown as ParsedCallDetails;

        try {
          const callDetails = new CallDetails({
            id,
            details: c,
            registry: this.api.registry,
          });
          return {
            callHash: hash.args[1],
            details: callDetails,
          };
        } catch (error) {
          console.error("Error creating CallDetails:", hash.args[1].toHuman(), error.message);
          return null;
        }
      }).filter(item => item !== null);

      return oc;
    } catch (error) {
      console.error("Failed to retrieve or process pending calls:", error);
      throw new Error("Error retrieving or processing pending multisig calls.");
    }
  };

  public getPendingCall = async ({
    id,
    callHash,
  }: {
    id: number;
    callHash: string | Hash;
  }): Promise<CallDetails | null> => {
    const maybeCall: Option<PalletInv4MultisigMultisigOperation> =
      await this._getPendingMultisigCall({ id, callHash });

    const call: PalletInv4MultisigMultisigOperation = maybeCall.unwrap();

    if (!call) return null;

    const c = call.toPrimitive() as unknown as ParsedCallDetails;

    const details = new CallDetails({
      id,
      details: c,
      registry: this.api.registry,
    });

    return details;
  };

  public getMultisigMembers = async (id: number): Promise<AccountId[]> => {
    const keys = await this._getMultisigMembers({ id });

    const mapped = keys.map(({ args: [_, member] }) => member);

    return mapped;
  };

  public getMultisigsForAccount = async (
    account: string | AccountId
  ): Promise<{ multisigId: number; tokens: BN; }[]> => {
    const entries = await this._getMultisigsForAccount({ account });

    const mapped = entries.map(
      ([
        {
          args: [_, coreId],
        },
        tokens,
      ]) => {
        const id = coreId.toNumber();
        const free = tokens.free;
        return { multisigId: id, tokens: free };
      }
    );

    return mapped;
  };

  public getMultisigMemberBalance = async ({
    id,
    address,
  }: {
    id: number;
    address: string | AccountId;
  }): Promise<BN> => {
    const balance = await this._getMemberBalance({ id, address });

    return balance;
  };

  public proposeNewMember = ({
    id,
    address,
    amount,
    proposalMetadata,
  }: {
    id: number;
    address: string | AccountId;
    amount: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    return this.buildMultisigCall({
      id,
      call: this._mintTokenMultisig({
        address,
        amount,
      }),
      proposalMetadata,
    });
  };

  public proposeMemberRemoval = ({
    id,
    address,
    amount,
    proposalMetadata,
  }: {
    id: number;
    address: string | AccountId;
    amount: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    return this.buildMultisigCall({
      id,
      call: this._burnTokenMultisig({
        address,
        amount,
      }),
      proposalMetadata,
    });
  };

  public vote = ({
    id,
    callHash,
    aye,
  }: {
    id: number;
    callHash: string | Hash;
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
    id: number;
    callHash: string | Hash;
  }) => {
    return this._withdrawVoteMultisigCall({
      id,
      callHash,
    });
  };

  public buildMultisigCall = ({
    id,
    proposalMetadata,
    feeAsset,
    call,
  }: {
    id: number;
    proposalMetadata?: string | Uint8Array;
    feeAsset?: FeeAsset;
    call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
  }): MultisigCall => {
    return new MultisigCall(
      this._createMultisigCall({
        id,
        proposalMetadata,
        feeAsset,
        call,
      }),
      feeAsset || this.feeAsset
    );
  };

  public sendXCMCall = ({
    id,
    destination,
    weight,
    callData,
    xcmFeeAsset,
    xcmFee,
    proposalMetadata,
  }: {
    id: number;
    destination: string;
    weight: BN;
    callData: `0x{string}` | Uint8Array;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._sendExternalMultisigCall({
      destination,
      weight,
      callData,
      xcmFeeAsset,
      xcmFee,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public transferXcmAsset = ({
    id,
    asset,
    amount,
    to,
    xcmFeeAsset,
    xcmFee,
    proposalMetadata,
  }: {
    id: number;
    asset: XcmAssetRepresentation;
    amount: BN;
    to: string | AccountId;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._transferExternalAssetMultisigCall({
      asset,
      amount,
      to,
      xcmFeeAsset,
      xcmFee,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public bridgeXcmAsset = ({
    id,
    asset,
    amount,
    destination,
    to,
    xcmFee,
    proposalMetadata,
  }: {
    id: number;
    asset: XcmAssetRepresentation;
    amount: BN;
    destination: string;
    to?: string | AccountId;
    xcmFee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._bridgeExternalMultisigAssetCall({
      asset,
      amount,
      to,
      destination,
      xcmFee,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public setMultisigParameters = ({
    id,
    proposalMetadata,
    metadata,
    minimumSupport,
    requiredApproval,
    frozenTokens,
  }: {
    id: number;
    proposalMetadata: string | Uint8Array;
    metadata?: string | Uint8Array;
    minimumSupport: Perbill | BN | number;
    requiredApproval: Perbill | BN | number;
    frozenTokens: boolean;
  }) => {
    const call = this._setMultisigParameters({
      id,
      minimumSupport,
      requiredApproval,
      frozenTokens,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public getXcmStatus = async () => {
    const chains = await this._getChainsUnderMaintenance();

    const chainStatus: {
      chainMultilocation: XcmV3MultiLocation;
      isUnderMaintenance: boolean;
    }[] = chains.map(([chainMultilocation, isUnderMaintenance]) => {
      return {
        chainMultilocation: chainMultilocation.args[0],
        isUnderMaintenance: isUnderMaintenance
          .unwrapOr(this.api.createType("bool", false))
          .toHuman(),
      };
    });

    return chainStatus;
  };

  private _getMultisig = (id: number) => {
    return getMultisig({ api: this.api, id });
  };

  private _createMultisigCall = ({
    id,
    proposalMetadata,
    feeAsset,
    call,
  }: {
    id: number;
    proposalMetadata?: string | Uint8Array;
    feeAsset: FeeAsset;
    call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
  }) => {
    return createMultisigCall({
      api: this.api,
      id,
      proposalMetadata,
      feeAsset,
      call,
    });
  };

  private _getPendingMultisigCalls = (
    id: number
  ): Promise<
    [StorageKey<[u32, Hash]>, PalletInv4MultisigMultisigOperation][]
  > => {
    return getPendingMultisigCalls({ api: this.api, id });
  };

  private _getPendingMultisigCall = ({
    id,
    callHash,
  }: {
    id: number;
    callHash: string | Hash;
  }): Promise<Option<PalletInv4MultisigMultisigOperation>> => {
    return getPendingMultisigCall({ api: this.api, id, callHash });
  };

  private _getMultisigMembers = ({ id }: { id: number; }) => {
    return getMultisigMembers({ api: this.api, id });
  };

  private _getMultisigsForAccount = ({
    account,
  }: {
    account: string | AccountId;
  }) => {
    return getAccountAssets({ api: this.api, account });
  };

  private _voteMultisigCall = ({
    id,
    callHash,
    aye,
  }: {
    id: number;
    callHash: string | Hash;
    aye: boolean;
  }) => {
    return voteMultisigCall({ api: this.api, id, callHash, aye });
  };

  private _withdrawVoteMultisigCall = ({
    id,
    callHash,
  }: {
    id: number;
    callHash: string | Hash;
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
    xcmFeeAsset,
    xcmFee,
  }: {
    destination: string;
    weight: BN;
    callData: `0x{string}` | Uint8Array;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
  }) => {
    return sendExternalMultisigCall({
      api: this.api,
      destination,
      weight,
      callData,
      xcmFeeAsset,
      xcmFee,
    });
  };

  private _transferExternalAssetMultisigCall = ({
    asset,
    amount,
    to,
    xcmFeeAsset,
    xcmFee,
  }: {
    asset: XcmAssetRepresentation;
    amount: BN;
    to: string | AccountId;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
  }) => {
    return transferExternalAssetMultisigCall({
      api: this.api,
      asset,
      amount,
      to,
      xcmFeeAsset,
      xcmFee,
    });
  };

  private _bridgeExternalMultisigAssetCall = ({
    asset,
    destination,
    xcmFee,
    amount,
    to,
  }: {
    asset: XcmAssetRepresentation;
    destination: string;
    xcmFee: BN;
    amount: BN;
    to?: string | AccountId;
  }) => {
    return bridgeExternalMultisigAssetCall({
      api: this.api,
      asset,
      destination,
      xcmFee,
      amount,
      to,
    });
  };

  private _getTotalIssuance = (id: number) => {
    return getTotalIssuance({ api: this.api, id: id });
  };

  private _getMemberBalance = ({
    id,
    address,
  }: {
    id: number;
    address: string | AccountId;
  }) => {
    return getMemberBalance({ api: this.api, id, address });
  };

  private _getChainsUnderMaintenance = () => {
    return getChainsUnderMaintenance({ api: this.api });
  };

  private _setMultisigParameters = ({
    id,
    metadata,
    minimumSupport,
    requiredApproval,
    frozenTokens,
  }: {
    id: number;
    metadata?: string | Uint8Array;
    minimumSupport?: Perbill | BN | number;
    requiredApproval?: Perbill | BN | number;
    frozenTokens?: boolean;
  }) => {
    return setParameters({
      api: this.api,
      id,
      metadata,
      minimumSupport,
      requiredApproval,
      frozenTokens,
    });
  };
}

export { Saturn };
