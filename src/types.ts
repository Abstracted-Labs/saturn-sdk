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
  executionThreshold?: number;
  metadata?: any;
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
  metadata: any;
  calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
};

type VoteMultisigCallParams = {
  api: ApiPromise;
  id: string;
  callHash: string;
};

type WithdrawVoteMultisigCallParams = {
  api: ApiPromise;
  id: string;
  callHash: string;
};

export type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  GetPendingMultisigCallsParams,
  GetMultisigParams,
  CreateMultisigCallParams,
  VoteMultisigCallParams,
  WithdrawVoteMultisigCallParams,
};
