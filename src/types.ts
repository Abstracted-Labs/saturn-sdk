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

type DefaultMultisigParams = {
  api: ApiPromise;
  id: string;
};

type CreateMultisigParams = {
  api: DefaultMultisigParams["api"];
  defaultAssetWeight?: number;
  defaultPermission?: boolean;
  executionThreshold: number;
  metadata?: string;
  assets?: string[];
};

type CreateMultisigCallParams = DefaultMultisigParams & {
  metadata?: string;
  calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
};

type VoteMultisigCallParams = DefaultMultisigParams & {
  callHash: `0x${string}`;
};

type WithdrawVoteMultisigCallParams = DefaultMultisigParams & {
  callHash: `0x${string}`;
};

type MintTokenMultisigParams = DefaultMultisigParams & {
  address: string;
  amount: string;
};

type BurnTokenMultisigParams = DefaultMultisigParams & {
  address: string;
  amount: string;
};

type GetTokenBalanceMultisigParams = DefaultMultisigParams & {
  address: string;
};

// TODO: Add params
type CreateSubtokenMultisigParams = DefaultMultisigParams & {};

type SetSubtokenWeightMultisigParams = DefaultMultisigParams & {};

type GetAssetWeightMultisigParams = DefaultMultisigParams & {};

type SetPermissionMultisigParams = DefaultMultisigParams & {};

export type {
  DefaultMultisigParams,
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
  MintTokenMultisigParams,
  BurnTokenMultisigParams,
  GetTokenBalanceMultisigParams,
  CreateSubtokenMultisigParams,
  SetSubtokenWeightMultisigParams,
  GetAssetWeightMultisigParams,
  SetPermissionMultisigParams,
};
