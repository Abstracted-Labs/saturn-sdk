import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import {
  AccountId,
  DispatchResult,
  Call,
  Hash,
  Perbill,
  Balance,
} from "@polkadot/types/interfaces";
import { ISubmittableResult, Signer } from "@polkadot/types/types";
import type { BN } from "@polkadot/util";
import { AnyJson } from "@polkadot/types-codec/types";
import { u32 } from "@polkadot/types-codec/primitive";
import { Text } from "@polkadot/types-codec/native";
import { Option, bool } from "@polkadot/types-codec";
import { PalletInv4MultisigMultisigOperation } from "@polkadot/types/lookup";
import { stringToU8a, hexToU8a } from "@polkadot/util";

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
  getTotalIssuance,
  getMemberBalance,
  getChainsUnderMaintenance,
  setParameters,
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
  TransferExternalAssetMultisigCallParams,
  MultisigCreateResult,
  ApiAndId,
  GetMultisigsForAccountParams,
  MultisigCallResult,
  Vote,
  MultisigCall,
  Tally,
  MultisigDetails,
  MultisigCreator,
  CallDetails,
  CallDetailsWithHash,
} from "./types";

import { getSignAndSendCallback } from "./utils";
import { BTreeMap, StorageKey } from "@polkadot/types";
import { XcmV1MultiLocation } from "@polkadot/types/lookup";

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

  constructor({ api }: { api: ApiPromise }) {
    if (!api.tx.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    if (!api.query.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    this.api = api;
    this.chains = setupTypes({ api });
  }

  public disconnect = () => {
    this.api.disconnect();
  };

  public createMultisig = ({
    metadata,
    minimumSupport,
    requiredApproval,
  }: {
    metadata?: string | Uint8Array;
    minimumSupport: Perbill | BN | number;
    requiredApproval: Perbill | BN | number;
  }): MultisigCreator => {
    const creator = new MultisigCreator({
      api: this.api,
      metadata,
      minimumSupport,
      requiredApproval,
    });

    return creator;
  };

  public getDetails = async (id: number): Promise<MultisigDetails | null> => {
    const multisig = (await this._getMultisig(id)).unwrap();

    if (!multisig) throw new Error("MULTISIG_DOES_NOT_EXIST");

    const totalIssuance: BN = await this._getTotalIssuance(id);

    const details = new MultisigDetails({
      id,
      account: multisig.account,
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
    const pendingCalls: [
      StorageKey<[u32, Hash]>,
      Option<PalletInv4MultisigMultisigOperation>
    ][] = await this._getPendingMultisigCalls(id);

    const openCalls = pendingCalls.reduce(
      (newCalls: { callHash: Hash; details: CallDetails }[], call) => {
        const callHash = call[0].args[1] as Hash;

        const maybeCallDetails = call[1].unwrap();

        if (maybeCallDetails) {
          newCalls.push({
            callHash,
            details: new CallDetails({ id, details: maybeCallDetails }),
          });
        }

        return newCalls;
      },
      []
    );

    return openCalls;
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

    const details = new CallDetails({ id, details: call });

    return details;
  };

  public getMultisigMembers = async (id: number): Promise<AccountId[]> => {
    const keys = await this._getMultisigMembers({ id });

    const mapped = keys.map(
      ({ args: [_, member] }) =>
        member
    );

    return mapped;
  };

  public getMultisigsForAccount = async (
    account: string | AccountId
  ): Promise<{ multisigId: number; tokens: BN }[]> => {
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
    call,
  }: {
    id: number;
    proposalMetadata?: string | Uint8Array;
    call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
  }): MultisigCall => {
    return new MultisigCall(
      this._createMultisigCall({
        id,
        proposalMetadata,
        call,
      })
    );
  };

  public sendXCMCall = ({
    id,
    destination,
    weight,
    callData,
    feeAsset,
    fee,
    proposalMetadata,
  }: {
    id: number;
    destination: string;
    weight: BN;
    callData: string | Uint8Array;
    feeAsset: Object;
    fee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._sendExternalMultisigCall({
      destination,
      weight,
      callData,
      feeAsset,
      fee,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public transferXcmAsset = ({
    id,
    asset,
    amount,
    to,
    feeAsset,
    fee,
    proposalMetadata,
  }: {
    id: number;
    asset: Object;
    amount: BN;
    to: string | AccountId;
    feeAsset: Object;
    fee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._transferExternalAssetMultisigCall({
      asset,
      amount,
      to,
      feeAsset,
      fee,
    });

    return this.buildMultisigCall({ id, call, proposalMetadata });
  };

  public bridgeXcmAsset = ({
    id,
    asset,
    amount,
    destination,
    to,
    fee,
    proposalMetadata,
  }: {
    id: number;
    asset: Object;
    amount: BN;
    destination: string;
    to: string | AccountId;
    fee: BN;
    proposalMetadata?: string | Uint8Array;
  }) => {
    const call = this._bridgeExternalMultisigAssetCall({
      asset,
      amount,
      to,
      destination,
      fee,
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
      chainMultilocation: XcmV1MultiLocation;
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
    call,
  }: {
    id: number;
    proposalMetadata?: string | Uint8Array;
    call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
  }) => {
    return createMultisigCall({ api: this.api, id, proposalMetadata, call });
  };

  private _getPendingMultisigCalls = (
    id: number
  ): Promise<
    [StorageKey<[u32, Hash]>, Option<PalletInv4MultisigMultisigOperation>][]
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

  private _getMultisigMembers = ({ id }: { id: number }) => {
    return getMultisigMembers({ api: this.api, id });
  };

  private _getMultisigsForAccount = ({
    account,
  }: {
    account: string | AccountId;
  }) => {
    return getMultisigsForAccount({ api: this.api, account });
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
    feeAsset,
    fee,
  }: {
    destination: string;
    weight: BN;
    callData: string | Uint8Array;
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
    to: string | AccountId;
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
    asset: Object;
    destination: string;
    fee: BN;
    amount: BN;
    to: string | AccountId;
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
