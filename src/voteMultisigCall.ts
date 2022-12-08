import type { VoteMultisigCallParams } from "./types";

const voteMultisigCall = ({ api, id, callHash }: VoteMultisigCallParams) => {
  return api.tx.inv4.voteMultisig([parseInt(id), null], callHash);
};

export default voteMultisigCall;
