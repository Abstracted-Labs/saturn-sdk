import { GetPendingMultisigCallsParams } from "../../../types";

import { PalletDaoManagerMultisigMultisigOperation } from "@polkadot/types/lookup";
import { StorageKey } from "@polkadot/types";
import { Hash } from "@polkadot/types/interfaces";
import { u32 } from "@polkadot/types-codec/primitive";

const getPendingMultisigCalls = ({
  api,
  id,
}: GetPendingMultisigCallsParams): Promise<[
    StorageKey<[u32, Hash]>,
    PalletDaoManagerMultisigMultisigOperation
][]> => {
  return api.query.inv4.multisig.entries(id);
};

export { getPendingMultisigCalls };
