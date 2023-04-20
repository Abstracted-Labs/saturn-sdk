import type { GetMemberBalance } from "../../../types";
import { BN } from "@polkadot/util";
import {  } from "@polkadot/api/augment";

const getMemberBalance = ({ api, id }: GetMemberBalance): Promise<BN> => {
  return api.query.coreAssets.totalIssuance(id);
};

export { getMemberBalance };
