import { SetSubtokenWeightMultisigParams } from "../types";

// TODO: Add params
const setSubtokenWeight = ({ api, id }: SetSubtokenWeightMultisigParams) => {
  return api.tx.inv4.setSubTokenWeight(parseInt(id));
};

export { setSubtokenWeight };
