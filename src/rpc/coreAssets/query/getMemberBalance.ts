import type { GetMemberBalance } from "../../../types";
import { BN } from "@polkadot/util";

const getMemberBalance = ({ api, id }: GetMemberBalance): Promise<BN> => {
  return api.query.coreAssets.totalIssuance(id);
};

export { getMemberBalance };
