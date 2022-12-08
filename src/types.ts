import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

type CreateMultisigParams = {
  api: ApiPromise;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  executionThreshold: number;
  metadata: any;
  assets?: string[];
};

type GetSignAndSendCallbackParams = {
  onInvalid?: () => void;
  onExecuted?: () => void;
  onSuccess?: () => void;
  onLoading?: () => void;
  onDropped?: () => void;
  onError?: () => void;
};

type GetPendingMultisigCallsParams = {
  api: ApiPromise;
  id: string;
};

type GetMultisigParams = {
  id: string;
  api: ApiPromise;
};

type CreateMultisigCallParams = {
  id: string;
  api: ApiPromise;
  metadata: any;
  calls: SubmittableExtrinsic<"promise", ISubmittableResult>[];
};

export type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  GetPendingMultisigCallsParams,
  GetMultisigParams,
  CreateMultisigCallParams,
};
