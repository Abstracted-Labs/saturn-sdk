import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import { ISubmittableResult, AnyJson, Signer } from "@polkadot/types/types";
import { AccountId, AccountId32, DispatchResult, Call, Hash, Perbill, Balance, DispatchError } from "@polkadot/types/interfaces";
import type { BN } from "@polkadot/util";
import { u32, u128 } from "@polkadot/types-codec/primitive";
import { Text } from "@polkadot/types-codec/native";
import { Enum, Struct, BTreeMap, Option, Bytes, bool, Result, Null, Vec } from "@polkadot/types-codec";
import type { AddressOrPair, AugmentedEvent, AugmentedEvents, SignerOptions, SubmittablePaymentResult } from "@polkadot/api-base/types";
import { FrameSystemEventRecord, PalletInv4Event } from "@polkadot/types/lookup";

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

export class MultisigCallResult {
    readonly isVoteStarted: boolean
    readonly votesAdded?: Vote;
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
        votesAdded?: Vote,
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

export class MultisigCall {
    readonly call: SubmittableExtrinsic<ApiTypes>;

    constructor (call: SubmittableExtrinsic<ApiTypes>) {
        this.call = call;
    }

    public paymentInfo (account: AddressOrPair, options?: Partial<SignerOptions>): SubmittablePaymentResult<ApiTypes> {
        return this.call.paymentInfo(account, options);
    };

    public async signAndSend (address: string, signer: Signer): Promise<MultisigCallResult> {
        return new Promise((resolve, reject) => {
            try {
        this.call.signAndSend(
            address,
            { signer },
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
          }
        );
            } catch (e) {
                reject(e);
            }
        });
    }
}

export interface CallDetails extends Struct {
    readonly tally: Tally;
    readonly originalCaller: AccountId32;
    readonly actualCall: Call;
    readonly metadata: Text;
}

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
    readonly type: 'Aye' | 'Nay';
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
};
