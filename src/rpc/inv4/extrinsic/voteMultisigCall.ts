import type { VoteMultisigCallParams } from "../../../types";

const voteMultisigCall = ({
  api,
  id,
  callHash,
  aye,
}: VoteMultisigCallParams) => {
  return api.tx.inv4.voteMultisig(id, callHash, aye);
};

export { voteMultisigCall };
