import type { GetMemberBalance } from "../../../types";
import { BN } from "@polkadot/util";

const getMemberBalance = ({ api, id, address }: GetMemberBalance): Promise<BN> => {
    return api.query.coreAssets.accounts(address, id).then((data) => data.free);
};

export { getMemberBalance };
