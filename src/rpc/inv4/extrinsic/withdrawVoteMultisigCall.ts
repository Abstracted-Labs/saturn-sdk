import type { WithdrawVoteMultisigCallParams } from "../../../types";

const withdrawVoteMultisigCall = ({
  api,
  id,
  callHash,
}: WithdrawVoteMultisigCallParams) => {
  return api.tx.inv4.withdrawVoteMultisig(id, callHash);
};

export { withdrawVoteMultisigCall };
