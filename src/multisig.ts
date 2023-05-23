import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import { AccountId, Call, Hash, Perbill } from "@polkadot/types/interfaces";
import type { BN } from "@polkadot/util";
import { u32 } from "@polkadot/types-codec/primitive";
import { Option } from "@polkadot/types-codec";
import { PalletInv4MultisigMultisigOperation } from "@polkadot/types/lookup";

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
  getMultisigsForAccount,
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
} from "./types";

import { StorageKey } from "@polkadot/types";
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
    registerType: XcmAssetRepresentation;
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

/**
 * Saturn class represents a wrapper around the Polkadot API for interacting with multisig accounts and performing multisig operations.
 *
 * @class
 * @public
 */
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

  /**
   * Constructs a new instance of the Saturn class.
   *
   * @constructor
   * @param {object} options - The options for initializing Saturn.
   * @param {ApiPromise} options.api - The Polkadot API instance.
   */
  constructor({ api }: { api: ApiPromise }) {
    if (!api.tx.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    if (!api.query.inv4) {
      throw new Error("API_PROMISE_DOES_NOT_CONTAIN_INV4_MODULE");
    }

    this.api = api;
    this.chains = setupTypes({ api });
    this.feeAsset = FeeAsset.TNKR;
  }

  /**
   * Sets the fee asset for multisig operations.
   *
   * @public
   * @param {FeeAsset} feeAsset - The fee asset to set.
   * @returns {void}
   */
  public setFeeAsset = (feeAsset: FeeAsset) => {
    this.feeAsset = feeAsset;
  };

  /**
   * Disconnects from the API.
   *
   * @public
   * @returns {void}
   */
  public disconnect = () => {
    this.api.disconnect();
  };

  /**
   * Creates a new multisig account.
   *
   * @public
   * @param {object} options - The options for creating a multisig account.
   * @param {string|Uint8Array} [options.metadata] - The metadata for the multisig account (optional).
   * @param {Perbill|BN|number} options.minimumSupport - The minimum support required for a proposal to pass.
   * @param {Perbill|BN|number} options.requiredApproval - The required approval threshold for a proposal to pass.
   * @param {FeeAsset} options.creationFeeAsset - The fee asset to use for creating the multisig account.
   * @returns {MultisigCreator} - The multisig creator object.
   */
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

  /**
   * Retrieves the details of a multisig account.
   *
   * @public
   * @param {number} id - The ID of the multisig account.
   * @returns {Promise<MultisigDetails|null>} - A promise that resolves to the multisig details, or null if the multisig account does not exist.
   */
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

  /**
   * Retrieves the total token supply in a multisig account.
   *
   * @public
   * @param {number} id - The ID of the multisig account.
   * @returns {Promise<BN>} - A promise that resolves to the total token supply.
   */
  public getSupply = async (id: number) => {
    const supply: BN = await this._getTotalIssuance(id);

    return supply;
  };

  /**
   * Retrieves the pending calls in a multisig account.
   *
   * @public
   * @param {number} id - The ID of the multisig account.
   * @returns {Promise<CallDetailsWithHash[]>} - A promise that resolves to an array of pending call details with hashes.
   */
  public getPendingCalls = async (
    id: number
  ): Promise<CallDetailsWithHash[]> => {
    const pendingCalls: [
      StorageKey<[u32, Hash]>,
      PalletInv4MultisigMultisigOperation
    ][] = await this._getPendingMultisigCalls(id);

    const oc = pendingCalls.map(([hash, call]) => {
      return {
        callHash: hash.args[1],
        details: new CallDetails({
          id,
          details: call,
          registry: this.api.registry,
        }),
      };
    });

    return oc;
  };

  /**
   * Retrieves a specific pending call in a multisig account.
   *
   * @public
   * @param {object} options - The options for retrieving a pending call.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|Hash} options.callHash - The hash of the call to retrieve.
   * @returns {Promise<CallDetails|null>} - A promise that resolves to the call details, or null if the call does not exist.
   */
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

    const details = new CallDetails({
      id,
      details: call,
      registry: this.api.registry,
    });

    return details;
  };

  /**
   * Retrieves the members of a multisig account.
   *
   * @public
   * @param {number} id - The ID of the multisig account.
   * @returns {Promise<AccountId[]>} - A promise that resolves to an array of member account IDs.
   */
  public getMultisigMembers = async (id: number): Promise<AccountId[]> => {
    const keys = await this._getMultisigMembers({ id });

    const mapped = keys.map(({ args: [_, member] }) => member);

    return mapped;
  };

  /**
   * Retrieves the multisig accounts associated with a specific account.
   *
   * @public
   * @param {string|AccountId} account - The account for which to retrieve multisig accounts.
   * @returns {Promise<{ multisigId: number; tokens: BN }[]>} - A promise that resolves to an array of multisig account IDs and token balances.
   */
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

  /**
   * Retrieves the token balance of a member in a multisig account.
   *
   * @public
   * @param {object} options - The options for retrieving a member's balance.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|AccountId} options.address - The address of the member account.
   * @returns {Promise<BN>} - A promise that resolves to the member's token balance.
   */
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

  /**
   * Proposes adding a new member to a multisig account.
   *
   * @public
   * @param {object} options - The options for proposing a new member.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|AccountId} options.address - The address of the new member account.
   * @param {BN} options.amount - The amount of tokens to be transferred to the new member.
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @returns {MultisigCall} - The multisig call representing the proposal.
   */
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

  /**
   * Proposes removing a member from a multisig account.
   *
   * @public
   * @param {object} options - The options for proposing member removal.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|AccountId} options.address - The address of the member account to remove.
   * @param {BN} options.amount - The amount of tokens to be transferred from the removed member to the proposer.
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @returns {MultisigCall} - The multisig call representing the proposal.
   */
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

  /**
   * Votes on a pending multisig call in a multisig account.
   *
   * @public
   * @param {object} options - The options for voting on a pending call.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|Hash} options.callHash - The hash of the pending call.
   * @param {boolean} options.aye - Whether to vote "aye" (true) or "nay" (false).
   * @returns {void}
   */
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

  /**
   * Withdraws a vote on a pending multisig call in a multisig account.
   *
   * @public
   * @param {object} options - The options for withdrawing a vote.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|Hash} options.callHash - The hash of the pending call.
   * @returns {void}
   */
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

  /**
   * Builds a multisig call using a SubmittableExtrinsic, Uint8Array, or Call object.
   *
   * @public
   * @param {object} options - The options for building a multisig call.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @param {FeeAsset} [options.feeAsset] - The fee asset to use for the multisig call (optional).
   * @param {SubmittableExtrinsic<ApiTypes>|Uint8Array|Call} options.call - The call to include in the multisig.
   * @returns {MultisigCall} - The multisig call object.
   */
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

  /**
   * Sends an XCM call from a multisig account to a destination.
   *
   * @public
   * @param {object} options - The options for sending an XCM call.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string} options.destination - The destination of the XCM call.
   * @param {BN} options.weight - The weight of the XCM call.
   * @param {`0x{string}`|Uint8Array} options.callData - The call data for the XCM call.
   * @param {XcmAssetRepresentation} options.xcmFeeAsset - The fee asset for the XCM call.
   * @param {BN} options.xcmFee - The fee amount for the XCM call.
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @returns {MultisigCall} - The multisig call representing the XCM call.
   */
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

  /**
   * Transfers an XCM asset from a multisig account to a recipient.
   *
   * @public
   * @param {object} options - The options for transferring an XCM asset.
   * @param {number} options.id - The ID of the multisig account.
   * @param {XcmAssetRepresentation} options.asset - The XCM asset to transfer.
   * @param {BN} options.amount - The amount of the XCM asset to transfer.
   * @param {string|AccountId} options.to - The recipient of the XCM asset.
   * @param {XcmAssetRepresentation} options.xcmFeeAsset - The fee asset for the XCM transfer.
   * @param {BN} options.xcmFee - The fee amount for the XCM transfer.
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @returns {MultisigCall} - The multisig call representing the XCM transfer.
   */
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

  /**
   * Bridges an XCM asset from a multisig account to a destination chain.
   *
   * @public
   * @param {object} options - The options for bridging an XCM asset.
   * @param {number} options.id - The ID of the multisig account.
   * @param {XcmAssetRepresentation} options.asset - The XCM asset to bridge.
   * @param {BN} options.amount - The amount of the XCM asset to bridge.
   * @param {string} options.destination - The destination chain for the bridged asset.
   * @param {BN} options.xcmFee - The fee amount for the XCM bridge.
   * @param {string|AccountId} [options.to] - The recipient of the bridged asset (optional).
   * @param {string|Uint8Array} [options.proposalMetadata] - The metadata for the proposal (optional).
   * @returns {MultisigCall} - The multisig call representing the XCM bridge.
   */
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

  /**
   * Sets the parameters of a multisig account.
   *
   * @public
   * @param {object} options - The options for setting multisig parameters.
   * @param {number} options.id - The ID of the multisig account.
   * @param {string|Uint8Array} options.proposalMetadata - The metadata for the proposal.
   * @param {string|Uint8Array} [options.metadata] - The metadata for the multisig account (optional).
   * @param {Perbill|BN|number} options.minimumSupport - The minimum support required for a proposal to pass.
   * @param {Perbill|BN|number} options.requiredApproval - The required approval threshold for a proposal to pass.
   * @param {boolean} options.frozenTokens - Whether the tokens of the multisig account should be frozen.
   * @returns {MultisigCall} - The multisig call representing the parameter change.
   */
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

  /**
   * Retrieves the status of XCM chains.
   *
   * @public
   * @returns {Promise<{ chainMultilocation: XcmV1MultiLocation; isUnderMaintenance: boolean }[]>} - A promise that resolves to an array of chain status objects.
   */
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
