import type { ApiPromise } from "@polkadot/api";

type GenerateMultisigParams = {
  name: string;
  signer: string;
  threshold: number;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  api: ApiPromise;
  onInvalid?: (callback: () => void) => void;
  onExecuted?: (callback: () => void) => void;
  onCancelled?: (callback: () => void) => void;
  onSuccess?: (callback: () => void) => void;
  onDropped?: (callback: () => void) => void;
  onError?: (callback: () => void) => void;
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

type MultisigStatus = "OPEN" | "EXECUTED" | "CANCELLED";

type Multisig = {
  status: MultisigStatus;
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
  GenerateMultisigParams,
  GetMultisigParams,
  Multisig,
  MultisigStatus,
};
