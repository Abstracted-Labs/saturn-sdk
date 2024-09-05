import { PalletDaoManagerMultisigMultisigOperation } from "@polkadot/types/lookup";
import { GetPendingMultisigCallParams } from "../../../types";
import { Option } from "@polkadot/types-codec";

const getPendingMultisigCall = async ({
  api,
  id,
  callHash,
}: GetPendingMultisigCallParams): Promise<
  Option<PalletDaoManagerMultisigMultisigOperation>
> => {
  const cd = (await api.query.inv4.multisig(
    id,
    callHash
  )) as Option<PalletDaoManagerMultisigMultisigOperation>;

  return cd;
};

export { getPendingMultisigCall };
