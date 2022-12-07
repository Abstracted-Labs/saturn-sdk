import type { ApiPromise } from "@polkadot/api";

type CreateMultisigParams = {
  api: ApiPromise;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  executionThreshold: number;
  allowReplica: boolean;
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

type GetMultisigParams = {
  id: string;
  api: ApiPromise;
};

type MultisigAction = "VOTE" | "CREATE";

type MultisigCall = {
  name: string | null;
  address: string;
  action: MultisigAction;
};

type MultisigBalance = {
  limit: number;
  filled: number;
  total: number;
};

type Multisig = {
  id: string;
  addVote: (address: string) => Promise<void>;
  removeVote: (address: string) => Promise<void>;
  listOpenCalls: () => Promise<MultisigCall[]>;
  addNewCall: (payload: {
    id: string;
    call: () => Promise<void>;
  }) => Promise<void>;
  removeCall: (id: string) => Promise<void>;
  getBalance: () => Promise<MultisigBalance>;
  getVoteWeight: (address: string) => Promise<number>;
};

export type {
  CreateMultisigParams,
  GetSignAndSendCallbackParams,
  GetMultisigParams,
  Multisig,
};
