import type { ApiPromise } from "@polkadot/api";

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

export type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  GetPendingMultisigCallsParams,
  GetMultisigParams,
};
