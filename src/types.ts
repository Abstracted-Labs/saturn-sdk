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
  amount: number;
};

type BurnTokenMultisigParams = DefaultMultisigParams & {
  address: string;
  amount: number;
};

type GetTokenBalanceMultisigParams = DefaultMultisigParams & {
  address: string;
};

type CreateSubTokenMultisigParams = DefaultMultisigParams & {
  tokens: {
    metadata: `0x${string}`;
    address: string;
  }[];
};

type SetSubTokenWeightMultisigParams = DefaultMultisigParams & {
  subTokenId: string;
  votingWeight: number;
};

type GetAssetWeightMultisigParams = DefaultMultisigParams & {
  assetId: string;
};

type GetSubAssetMultisigParams = DefaultMultisigParams & {
  subAssetId: string;
};

type OneOrPercent =
  | {
      zeroPoint: number;
      one: never;
    }
  | {
      zeroPoint: never;
      one: null;
    };

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
  CreateSubTokenMultisigParams,
  SetSubTokenWeightMultisigParams,
  GetAssetWeightMultisigParams,
  GetSubAssetMultisigParams,
  OneOrPercent,
};
