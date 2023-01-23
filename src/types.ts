import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

type GetSignAndSendCallbackParams = {
  onInvalid?: (payload: ISubmittableResult) => void;
  onExecuted?: (payload: ISubmittableResult) => void;
  onSuccess?: (payload: ISubmittableResult) => void;
  onLoading?: (payload: ISubmittableResult) => void;
  onDropped?: (payload: ISubmittableResult) => void;
  onError?: (payload: ISubmittableResult) => void;
  onUnknown?: (payload: ISubmittableResult) => void;
};

type CreateMultisigParams = {
  api: ApiPromise;
  defaultAssetWeight?: number;
  defaultPermission?: boolean;
  executionThreshold: number;
  metadata?: string;
  assets?: string[];
};

type GetPendingMultisigCallsParams = {
  api: ApiPromise;
  id: string;
};

type GetMultisigParams = {
  api: ApiPromise;
  id: string;
};

type CreateMultisigCallParams = {
  api: ApiPromise;
  id: string;
  metadata?: string;
  calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
};

type VoteMultisigCallParams = {
  api: ApiPromise;
  id: string;
  callHash: `0x${string}`;
};

type WithdrawVoteMultisigCallParams = {
  api: ApiPromise;
  id: string;
  callHash: `0x${string}`;
};

type MintTokenMultisigParams = {
  api: ApiPromise;
  id: string;
  address: string;
  amount: string;
};

type BurnTokenMultisigParams = {
  api: ApiPromise;
  id: string;
  address: string;
  amount: string;
};

type GetTokenBalanceMultisigParams = {
  api: ApiPromise;
  id: string;
  address: string;
};

type GetAllTokenBalancesMultisigParams = {
  api: ApiPromise;
  id: string;
};

export type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  GetPendingMultisigCallsParams,
  GetMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetTokenBalanceMultisigParams,
  GetAllTokenBalancesMultisigParams,
};
