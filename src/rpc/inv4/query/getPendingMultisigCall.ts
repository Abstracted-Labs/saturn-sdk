import { PalletInv4MultisigMultisigOperation } from "@polkadot/types/lookup";
import { GetPendingMultisigCallParams } from "../../../types";
import { Option } from "@polkadot/types-codec";

const getPendingMultisigCall = async ({
  api,
  id,
  callHash,
}: GetPendingMultisigCallParams): Promise<Option<PalletInv4MultisigMultisigOperation>> => {
    const cd = (await api.query.inv4.multisig(id, callHash)) as Option<PalletInv4MultisigMultisigOperation>;

    return cd;
};

export { getPendingMultisigCall };
