import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic, Call } from "@polkadot/api/types";
import { ISubmittableResult, DispatchResult } from "@polkadot/types/types";

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
  callHash: `0x${string}`;
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
  calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
};

type VoteMultisigCallParams = DefaultMultisigParams & {
  callHash: `0x${string}`;
  id: string;
  aye: boolean;
};

type WithdrawVoteMultisigCallParams = DefaultMultisigParams & {
  callHash: `0x${string}`;
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
  weight: string;
  callData: `0x${string}`;
};

type TransferExternalAssetMultisigCallParams = DefaultMultisigParams & {
  destination: string;
  asset: string;
  amount: string;
  to: string;
};

type MultisigCreateResult = {
    id: number;
    account: string;
    metadata: string;
    minimumSupport: BN;
    requiredApproval: BN;
    creator: string;
    tokenSupply: BN;
};

type MultisigCallVoteStarted = {
    id: number;
    account: string;
    callHash: string;
    call: Call;
    voter: string;
    votesAdded: { aye: BN } | { nay: BN };
}

type MultisigCallExecuted = {
    id: number;
    account: string;
    callHash: string;
    call: Call;
    voter: string;
    executionResult: DispatchResult;
}

type MultisigCallResult = {
    executed: bool;
    result: MultisigCallVoteStarted | MultisigCallExecuted;
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
  SendExternalMultisigCallParams,
  TransferExternalAssetMultisigCallParams,
  MultisigCreateResult,
  MultisigCallResult,
  MultisigCallExecuted,
  MultisigCallVoteStarted,
    ApiAndId,
    GetMultisigsForAccountParams,
};
