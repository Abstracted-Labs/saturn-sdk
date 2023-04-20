import type { GetTotalIssuance } from "../../../types";
import { BN } from "@polkadot/util";

const getTotalIssuance = ({ api, id }: GetTotalIssuance): Promise<BN> => {
  return api.query.coreAssets.totalIssuance(id);
};

export { getTotalIssuance };
