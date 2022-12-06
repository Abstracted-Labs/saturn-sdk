import type { ApiPromise } from "@polkadot/api";

type GenerateMultisigParams = {
  threshold: number;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  api: ApiPromise;
};

type GetMultisigParams = {
  address: string;
  api: ApiPromise;
};

type MultisigCall = {
  name: string | null;
  address: string;
  action: "VOTE" | "CREATE";
};

type MultisigBalance = {
  limit: number;
  filled: number;
  total: number;
};

type Multisig = {
  status: "OPEN" | "EXECUTED" | "CANCELLED";
  addVote: (address: string) => Promise<void>;
  removeVote: (address: string) => Promise<void>;
  execute: (signer: string) => Promise<void>;
  listOpenCalls: () => Promise<MultisigCall[]>;
  getBalance(): Promise<MultisigBalance>;
};

export type { GenerateMultisigParams, GetMultisigParams, Multisig };
