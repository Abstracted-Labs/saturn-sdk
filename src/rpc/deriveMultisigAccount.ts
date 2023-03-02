import { DeriveMultisigAccountParams } from "../types";

const deriveMultisigAccount = ({ api, id }: DeriveMultisigAccountParams) => {
  return api.call.saturnAccountDeriver.deriveAccount(parseInt(id));
};

export { deriveMultisigAccount };
