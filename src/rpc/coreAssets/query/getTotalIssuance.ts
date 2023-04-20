import type { GetTotalIssuance } from "../../../types";

const getTotalIssuance = ({ api, id }: GetTotalIssuance) => {
  return api.query.coreAssets.totalIssuance(parseInt(id));
};

export { getTotalIssuance };
