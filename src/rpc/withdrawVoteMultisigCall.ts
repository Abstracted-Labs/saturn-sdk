import type { WithdrawVoteMultisigCallParams } from "../types";

const withdrawVoteMultisigCall = ({
  api,
  callHash,
}: WithdrawVoteMultisigCallParams) => {
  return api.tx.inv4.withdrawVoteMultisig(null, callHash);
};

export { withdrawVoteMultisigCall };
