import { ApiAndId } from "../../../types";

const getMultisigMembers = ({ api, id }: ApiAndId) => {
  return api.query.inv4.coreMembers.keys(id);
};

export { getMultisigMembers };
