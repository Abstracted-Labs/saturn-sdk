import type { AddNewMemberMultisigParams } from "../types";

const addNewMemberMultisig = ({
  api,
  id,
  amount,
  address,
}: AddNewMemberMultisigParams) => {
  return api.tx.inv4.iptMint([parseInt(id), null], amount, address);
};

export { addNewMemberMultisig };
