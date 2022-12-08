import type { WithdrawMultisigCallParams } from "./types";

const withdrawVoteMultisigCall = ({
  api,
  id,
  callHash,
}: WithdrawMultisigCallParams) => {
  return api.tx.inv4.voteMultisig([parseInt(id), null], callHash);
};

export default withdrawVoteMultisigCall;
