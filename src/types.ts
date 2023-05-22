import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import { ISubmittableResult, AnyJson, Signer, Registry } from "@polkadot/types/types";
import {
  AccountId,
  DispatchResult,
  Call,
  Hash,
  Perbill,
  Balance,
} from "@polkadot/types/interfaces";
import { BN } from "@polkadot/util";
import { u32 } from "@polkadot/types-codec/primitive";
import { Text } from "@polkadot/types-codec/native";
import {
  Enum,
  Struct,
  BTreeMap,
} from "@polkadot/types-codec";
import type {
  AddressOrPair,
  SignerOptions,
  SubmittablePaymentResult,
} from "@polkadot/api-base/types";
import {
  PalletInv4MultisigMultisigOperation,
  PalletInv4VotingTally,
} from "@polkadot/types/lookup";
import { createCore, getTotalIssuance, getMultisig } from "./rpc";
import { u8aToString } from "@polkadot/util";

type GetSignAndSendCallbackParams = {
  onInvalid?: (payload: ISubmittableResult) => void;
  onExecuted?: (payload: ISubmittableResult) => void;
  onSuccess?: (payload: ISubmittableResult) => void;
  onLoading?: (payload: ISubmittableResult) => void;
  onDropped?: (payload: ISubmittableResult) => void;
  onError?: (payload: ISubmittableResult) => void;
  onUnknown?: (payload: ISubmittableResult) => void;
};

type DefaultMultisigParams = {
  api: ApiPromise;
};

type ApiAndId = {
  api: ApiPromise;
  id: number;
};

type GetMultisigsForAccountParams = DefaultMultisigParams & {
  account: string | AccountId;
};

type GetMultisigParams = DefaultMultisigParams & {
  id: number;
};

type GetPendingMultisigCallsParams = DefaultMultisigParams & {
  id: number;
};

type GetPendingMultisigCallParams = DefaultMultisigParams & {
  id: number;
  callHash: string | Hash;
};

type CreateMultisigParams = {
  api: DefaultMultisigParams["api"];
  metadata?: string | Uint8Array;
  minimumSupport: Perbill | BN | number;
  requiredApproval: Perbill | BN | number;
  creationFeeAsset: "TNKR" | "KSM";
};

type CreateMultisigCallParams = DefaultMultisigParams & {
  proposalMetadata?: string | Uint8Array;
  id: number;
  feeAsset: FeeAsset;
  call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
};

type VoteMultisigCallParams = DefaultMultisigParams & {
  callHash: string | Hash;
  id: number;
  aye: boolean;
};

type WithdrawVoteMultisigCallParams = DefaultMultisigParams & {
  callHash: string | Hash;
  id: number;
};

type MintTokenMultisigParams = DefaultMultisigParams & {
  address: string | AccountId;
  amount: BN;
};

type BurnTokenMultisigParams = DefaultMultisigParams & {
  address: string | AccountId;
  amount: BN;
};

type TransferExternalAssetMultisigCallParams = {
    api: ApiPromise;
    asset: XcmAssetRepresentation;
    amount: BN;
    to: string | AccountId;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
};

type SendExternalMultisigCallParams = {
    api: ApiPromise;
    destination: string;
    weight: BN;
    callData: `0x{string}` | Uint8Array;
    xcmFeeAsset: XcmAssetRepresentation;
    xcmFee: BN;
};

type BridgeExternalMultisigAssetParams = {
    api: ApiPromise;
    asset: XcmAssetRepresentation;
    destination: string;
    xcmFee: BN;
    amount: BN;
    to?: string | AccountId;
};

type XcmAssetRepresentation = { [key: string]: any };

export class MultisigCreateResult {
  readonly id: number;
  readonly account: AccountId;
  readonly metadata: Text;
  readonly minimumSupport: Perbill;
  readonly requiredApproval: Perbill;
  readonly creator: AccountId;
  readonly tokenSupply: Balance;

  constructor({
    id,
    account,
    metadata,
    minimumSupport,
    requiredApproval,
    creator,
    tokenSupply,
  }: {
    id: number;
    account: AccountId;
    metadata: Text;
    minimumSupport: Perbill;
    requiredApproval: Perbill;
    creator: AccountId;
    tokenSupply: Balance;
  }) {
    this.id = id;
    this.account = account;
    this.metadata = metadata;
    this.minimumSupport = minimumSupport;
    this.requiredApproval = requiredApproval;
    this.creator = creator;
    this.tokenSupply = tokenSupply;
  }

  public toHuman(): AnyJson {
    return {
      id: this.id,
      account: this.account.toHuman(),
      metadata: this.metadata.toHuman(),
      minimumSupport: this.minimumSupport.toHuman(),
      requiredApproval: this.requiredApproval.toHuman(),
      creator: this.creator.toHuman(),
      tokenSupply: this.tokenSupply.toHuman(),
    };
  }
}

export class MultisigCallResult {
  readonly isVoteStarted: boolean;
  readonly votesAdded?: Vote;
  readonly isExecuted: boolean;
  readonly executionResult?: DispatchResult;

  readonly id: u32;
  readonly account: AccountId;
  readonly callHash: Hash;
  readonly call: Call;
  readonly voter: AccountId;

  constructor({
    isVoteStarted,
    votesAdded,
    isExecuted,
    executionResult,

    id,
    account,
    callHash,
    call,
    voter,
  }: {
    isVoteStarted: boolean;
    votesAdded?: Vote;
    isExecuted: boolean;
    executionResult?: DispatchResult;

    id: u32;
    account: AccountId;
    callHash: Hash;
    call: Call;
    voter: AccountId;
  }) {
    this.isVoteStarted = isVoteStarted;
    this.votesAdded = votesAdded;
    this.isExecuted = isExecuted;
    this.executionResult = executionResult;

    this.id = id;
    this.account = account;
    this.callHash = callHash;
    this.call = call;
    this.voter = voter;
  }

  public toHuman(): AnyJson {
    return {
      isVoteStarted: this.isVoteStarted,
      isExecuted: this.isExecuted,
      votesAdded: this.votesAdded?.toHuman(),
      executionResult: this.executionResult?.isErr
        ? this.executionResult.asErr.toHuman()
        : this.executionResult?.asOk.toHuman(),

      id: this.id.toHuman(),
      account: this.account.toHuman(),
      callHash: this.callHash.toHuman(),
      call: this.call.toHuman(),
      voter: this.voter.toHuman(),
    };
  }
}

export class MultisigCall {
  readonly call: SubmittableExtrinsic<ApiTypes>;
  readonly feeAsset: FeeAsset;

    constructor(call: SubmittableExtrinsic<ApiTypes>, feeAsset: FeeAsset) {
        this.call = call;
        this.feeAsset = feeAsset;
  }

  public paymentInfo(
    account: AddressOrPair,
    options?: Partial<SignerOptions>
  ): SubmittablePaymentResult<ApiTypes> {
    return this.call.paymentInfo(account, options);
  }

  public async signAndSend(
    address: string,
    signer: Signer,
    feeAsset?: FeeAsset
  ): Promise<MultisigCallResult> {
    return new Promise((resolve, reject) => {
      try {
          this.call.signAndSend(address, { signer, assetId: processFeeAssetAsHex(this.call.registry, feeAsset || this.feeAsset) }, ({ events, status }) => {
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
                  votesAdded: args[3] as Vote,
                  callHash: args[4] as Hash,
                  call: args[5] as Call,
                });

                resolve(result);

                break;
              }
              default:
                break;
            }
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export class MultisigCreator {
  readonly call: SubmittableExtrinsic<ApiTypes>;
  readonly feeAsset: FeeAsset;

  constructor({
    api,
    feeAsset,
    metadata,
    minimumSupport,
    requiredApproval,
    creationFeeAsset,
  }: {
    api: ApiPromise;
    feeAsset: FeeAsset;
    metadata?: string | Uint8Array;
    minimumSupport: Perbill | BN | number;
    requiredApproval: Perbill | BN | number;
    creationFeeAsset: FeeAsset;
  }) {
    this.call = createCore({
      api,
      metadata,
      minimumSupport,
      requiredApproval,
      creationFeeAsset: processFeeAssetAsName(creationFeeAsset),
    });

    this.feeAsset = feeAsset;
  }

  public paymentInfo(
    account: AddressOrPair,
    feeAsset?: FeeAsset,
  ): SubmittablePaymentResult<ApiTypes> {
      return this.call.paymentInfo(account, {assetId: processFeeAssetAsNumber(this.call.registry, feeAsset || this.feeAsset)});
  }

  public async signAndSend(
    address: string,
    signer: Signer,
    feeAsset?: FeeAsset,
  ): Promise<MultisigCreateResult> {
    return new Promise((resolve, reject) => {
      try {
          this.call.signAndSend(address, { signer, assetId: processFeeAssetAsHex(this.call.registry, feeAsset || this.feeAsset) }, ({ events, status }) => {
              console.log("status: ", status.toHuman());
              console.log("events: ", events);

          if (status.isInBlock) {
            const event = events.find(
              ({ event }) => event.method === "CoreCreated"
            )?.event.data;

            const assetsEvent = events.find(
              ({ event }) =>
                event.section === "coreAssets" && event.method === "Endowed"
            )?.event.data;

            if (!event || !assetsEvent) {
              throw new Error("SOMETHING_WENT_WRONG");
            }

            const result = new MultisigCreateResult({
              id: (event[1] as u32).toNumber(),
              account: event[0] as AccountId,
              metadata: event[2] as Text,
              minimumSupport: event[3] as Perbill,
              requiredApproval: event[4] as Perbill,
              creator: this.call.registry.createType("AccountId", address),
              tokenSupply: assetsEvent[2] as Balance,
            });

            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export class CallDetails {
  readonly id: number;
  readonly tally: PalletInv4VotingTally;
  readonly originalCaller: AccountId;
  readonly actualCall: Call;
  readonly proposalMetadata?: string | Uint8Array;

  constructor({
    id,
    details,
      registry,
  }: {
    id: number;
    details: PalletInv4MultisigMultisigOperation;
      registry: Registry;
  }) {
    this.id = id;
    this.tally = details.tally;
    this.originalCaller = details.originalCaller;
    this.actualCall = registry.createType(
      "Call",
        details.toHuman().actualCall
    );
      const meta = details.metadata?.toString();

      if (meta) this.proposalMetadata = meta;
  }

  public async canExecute(api: ApiPromise, votes: BN): Promise<boolean> {
    const totalIssuance: BN = await getTotalIssuance({ api, id: this.id });
    const details = (await getMultisig({ api, id: this.id })).unwrap();

    if (!details) return false;

    const { minimumSupport, requiredApproval } = details;

    const aye: BN = this.tally.ayes;
    const nay: BN = this.tally.nays;

    const support = aye.add(votes).div(totalIssuance);
    const approval = aye.add(votes).div(aye.add(votes).add(nay));

    return support.gt(minimumSupport) && approval.gt(requiredApproval);
  }

  public toHuman(): AnyJson {
    return {
      id: this.id,
      tally: this.tally.toHuman(),
      originalCaller: this.originalCaller.toHuman(),
      actualCall: this.actualCall.toHuman(),
      proposalMetadata: typeof this.proposalMetadata == "string" ? this.proposalMetadata : u8aToString(this.proposalMetadata),
    };
  }
}

export type CallDetailsWithHash = {
    callHash: Hash;
    details: CallDetails;
};

export interface Tally extends Struct {
  readonly ayes: Balance;
  readonly nays: Balance;
  readonly records: BTreeMap<AccountId, Vote>;
}

export interface Vote extends Enum {
  readonly isAye: boolean;
  readonly asAye: Balance;
  readonly isNay: boolean;
  readonly asNay: Balance;
  readonly type: "Aye" | "Nay";
}

export class MultisigDetails {
  readonly id: number;
  readonly account: AccountId;
  readonly metadata: string;
  readonly minimumSupport: Perbill;
  readonly requiredApproval: Perbill;
  readonly frozenTokens: boolean;
  readonly totalIssuance: BN;

  constructor({
    id,
    account,
    metadata,
    minimumSupport,
    requiredApproval,
    frozenTokens,
    totalIssuance,
  }: {
    id: number;
    account: AccountId;
    metadata: string;
    minimumSupport: Perbill;
    requiredApproval: Perbill;
    frozenTokens: boolean;
    totalIssuance: BN;
  }) {
    this.id = id;
    this.account = account;
    this.metadata = metadata;
    this.minimumSupport = minimumSupport;
    this.requiredApproval = requiredApproval;
    this.frozenTokens = frozenTokens;
    this.totalIssuance = totalIssuance;
  }

  public toHuman(): AnyJson {
    return {
      id: this.id,
      account: this.account.toHuman(),
      metadata: this.metadata,
      minimumSupport: this.minimumSupport.toHuman(),
      requiredApproval: this.requiredApproval.toHuman(),
      frozenTokens: this.frozenTokens,
      totalIssuance: this.totalIssuance.toString(),
    };
  }
}

type GetTotalIssuance = DefaultMultisigParams & {
  id: number;
};

type GetMemberBalance = DefaultMultisigParams & {
  id: number;
  address: string | AccountId;
};

export enum FeeAsset {
    TNKR,
    KSM
}

function processFeeAssetAsHex(registry: Registry, feeAsset: FeeAsset): `0x${string}` | null {
    switch (feeAsset) {
        case FeeAsset.TNKR:
            return null;
        case FeeAsset.KSM:
            return registry.createType("Option<u32>", 1).toHex();
    }
}

function processFeeAssetAsNumber(registry: Registry, feeAsset: FeeAsset): number | null {
    switch (feeAsset) {
        case FeeAsset.TNKR:
            return null;
        case FeeAsset.KSM:
            return 1;
    }
}

function processFeeAssetAsName(feeAsset: FeeAsset): "TNKR" | "KSM" {
    switch (feeAsset) {
        case FeeAsset.TNKR:
            return "TNKR";
        case FeeAsset.KSM:
            return "KSM";
    }
}

export type {
  DefaultMultisigParams,
  GetPendingMultisigCallsParams,
  GetPendingMultisigCallParams,
  GetMultisigParams,
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  TransferExternalAssetMultisigCallParams,
  ApiAndId,
  GetMultisigsForAccountParams,
  GetTotalIssuance,
  GetMemberBalance,
  XcmAssetRepresentation,
  SendExternalMultisigCallParams,
  BridgeExternalMultisigAssetParams,
};
