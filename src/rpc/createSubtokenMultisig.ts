import { CreateSubTokenMultisigParams } from "../types";

const createSubTokenMultisig = ({
  api,
  id,
  tokens,
}: CreateSubTokenMultisigParams) => {
  return api.tx.inv4.createSubToken(
    parseInt(id),
    tokens.map((token) => {
      return [
        [parseInt(id), token.metadata],
        [token.address, 0],
      ];
    })
  );
};

export { createSubTokenMultisig };
