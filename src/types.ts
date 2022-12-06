import type { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsicFunction } from "@polkadot/api/types";
import { AnyTuple } from "@polkadot/types/types";

type GenerateMultisigParams = {
  id: string;
  signer: string;
  threshold: number;
  defaultAssetWeight: number;
  defaultPermission: boolean;
  api: ApiPromise;
  includeCaller?: boolean;
  calls: SubmittableExtrinsicFunction<"promise", AnyTuple>[];
  metadata: any;
  onInvalid?: () => void;
  onExecuted?: () => void;
  onCancelled?: () => void;
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

export type { GenerateMultisigParams, GetMultisigParams, Multisig };
