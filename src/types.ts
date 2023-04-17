import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult, AnyJson } from "@polkadot/types/types";
import { AccountId, DispatchResult, Call, Hash, Perbill, Balance } from "@polkadot/types/interfaces";
import type { BN } from "@polkadot/util";
import { u32 } from "@polkadot/types-codec/primitive";
import { Text } from "@polkadot/types-codec/native";
import { Enum } from "@polkadot/types-codec";

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
  id: string;
};

type GetMultisigsForAccountParams = DefaultMultisigParams & {
  account: string;
};

type GetMultisigParams = DefaultMultisigParams & {
  id: string;
};

type GetPendingMultisigCallsParams = DefaultMultisigParams & {
  id: string;
};

type GetPendingMultisigCallParams = DefaultMultisigParams & {
  id: string;
  callHash: string;
};

type CreateMultisigParams = {
  api: DefaultMultisigParams["api"];
  metadata?: string;
  minimumSupport: number;
  requiredApproval: number;
};

type CreateMultisigCallParams = DefaultMultisigParams & {
  metadata?: string;
  id: string;
  call: SubmittableExtrinsic<"promise", ISubmittableResult>;
};

type VoteMultisigCallParams = DefaultMultisigParams & {
  callHash: string;
  id: string;
  aye: boolean;
};

type WithdrawVoteMultisigCallParams = DefaultMultisigParams & {
  callHash: string;
  id: string;
};

type MintTokenMultisigParams = DefaultMultisigParams & {
  address: string;
  amount: number;
};

type BurnTokenMultisigParams = DefaultMultisigParams & {
  address: string;
  amount: number;
};

type SendExternalMultisigCallParams = DefaultMultisigParams & {
  destination: string;
  weight: BN;
  callData: string;
  feeAsset: Object;
  fee: BN;
};

type TransferExternalAssetMultisigCallParams = DefaultMultisigParams & {
  asset: Object;
  amount: BN;
  to: string;
  feeAsset: Object;
  fee: BN;
};

export class MultisigCreateResult {
  readonly id: u32;
  readonly account: AccountId;
  readonly metadata: Text;
  readonly minimumSupport: Perbill;
  readonly requiredApproval: Perbill;
  readonly creator: AccountId;
  readonly tokenSupply: Balance;

    constructor ({
        id,
        account,
        metadata,
        minimumSupport,
        requiredApproval,
        creator,
        tokenSupply
    }: {
        id: u32;
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

    public toHuman (): AnyJson {
        return {
            id: this.id.toHuman(),
            account: this.account.toHuman(),
            metadata: this.metadata.toHuman(),
            minimumSupport: this.minimumSupport.toHuman(),
            requiredApproval: this.requiredApproval.toHuman(),
            creator: this.creator.toHuman(),
            tokenSupply: this.tokenSupply.toHuman()
        }
    }
};

export interface VotesAdded extends Enum {
    readonly isAye: boolean;
    readonly isNay: boolean;
    readonly asAye: Balance;
    readonly asNay: Balance;
    readonly type: 'Aye' | 'Nay';
}

export class MultisigCallResult {
    readonly isVoteStarted: boolean
    readonly votesAdded?: VotesAdded;
    readonly isExecuted: boolean;
    readonly executionResult?: DispatchResult;

    readonly id: u32;
    readonly account: AccountId;
    readonly callHash: Hash;
    readonly call: Call;
    readonly voter: AccountId;

    constructor ({
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
        isVoteStarted: boolean,
        votesAdded?: VotesAdded,
        isExecuted: boolean,
        executionResult?: DispatchResult,

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

    public toHuman (): AnyJson {
        return {
            isVoteStarted: this.isVoteStarted,
            isExecuted: this.isExecuted,
            votesAdded: this.votesAdded?.toHuman(),
            executionResult: this.executionResult?.isErr ? this.executionResult.asErr.toHuman() : this.executionResult?.asOk.toHuman(),

            id: this.id.toHuman(),
            account: this.account.toHuman(),
            callHash: this.callHash.toHuman(),
            call: this.call.toHuman(),
            voter: this.voter.toHuman(),
        }
    }
};

type CallDetails = {
  tally: {
    ayes: BN;
    nays: BN;
    records: Record<string, Record<"aye" | "nay", BN>>;
  };
  originalCaller: string;
  actualCall: Call;
  metadata: string | null;
};

type BridgeExternalMultisigAssetCallParams = DefaultMultisigParams & {
  asset: string;
  destination: string;
  fee: BN;
  amount: BN;
  to: string;
};

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
  SendExternalMultisigCallParams,
  TransferExternalAssetMultisigCallParams,
  ApiAndId,
  GetMultisigsForAccountParams,
  CallDetails,
  BridgeExternalMultisigAssetCallParams,
};
