import type { ApiPromise } from "@polkadot/api";

type GenerateMultisigParams = {
  threshold: number;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  api: ApiPromise;
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
  getBalance(): Promise<MultisigBalance>;
  getVoteWeight(address: string): Promise<number>;
};

export type {
  GenerateMultisigParams,
  GetMultisigParams,
  Multisig,
  MultisigStatus,
};
