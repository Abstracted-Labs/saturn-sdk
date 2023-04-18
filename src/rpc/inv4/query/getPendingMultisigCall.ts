import { GetPendingMultisigCallParams, CallDetails } from "../../../types";
import { Option } from "@polkadot/types-codec";

const getPendingMultisigCall = async ({
  api,
  id,
  callHash,
}: GetPendingMultisigCallParams): Promise<Option<CallDetails>> => {
    const cd = (await api.query.inv4.multisig(parseInt(id), callHash)) as Option<CallDetails>;

    return cd;
};

export { getPendingMultisigCall };
