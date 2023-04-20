import type { GetMemberBalance } from "../../../types";

const getMemberBalance = ({ api, id }: GetMemberBalance) => {
  return api.query.coreAssets.totalIssuance(parseInt(id));
};

export { getMemberBalance };
