import type { VoteMultisigCallParams } from "../types";

const voteMultisigCall = ({ api, callHash }: VoteMultisigCallParams) => {
  return api.tx.inv4.voteMultisig(null, callHash);
};

export { voteMultisigCall };
