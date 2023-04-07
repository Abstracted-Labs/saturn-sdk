import { ApiAndId } from "../../../types";

const getMultisigMembers = ({
  api,
  id,
}: { api: ApiPromise; id: string }) => {
  return api.query.inv4.coreMembers.keys(parseInt(id));
};

export { getMultisigMembers };
