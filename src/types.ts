import type { ApiPromise } from "@polkadot/api";

type MultisigParams = {
  threshold: number;
  defaultAssetWeight: number;
  defaultPermission: boolean;
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
  addVote: (address: string) => Promise<void>;
  removeVote: (address: string) => Promise<void>;
  execute: () => Promise<void>;
  listOpenCalls: () => Promise<MultisigCall[]>;
  getBalance(): Promise<MultisigBalance>;
};

export type { MultisigParams, Multisig };
