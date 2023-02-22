import { CreateSubTokenMultisigParams } from "../types";

const createSubTokenMultisig = ({
  api,
  tokens,
}: CreateSubTokenMultisigParams) => {
  return api.tx.inv4.createSubToken(
    tokens.map((token) => {
      return [token.metadata, [token.address, 0]];
    })
  );
};

export { createSubTokenMultisig };
