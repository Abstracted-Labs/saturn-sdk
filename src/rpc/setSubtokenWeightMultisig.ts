import { SetSubTokenWeightMultisigParams } from "../types";

const setSubTokenWeightMultisig = ({
  api,
  id,
  subTokenId,
  votingWeight,
}: SetSubTokenWeightMultisigParams) => {
  let parsedVotingWeight = api.createType("OneOrPercent", {
    Percent: votingWeight,
  });

  if (votingWeight < 0) {
    throw new Error("VOTING_WEIGHT_MUST_BE_GREATER_THAN_ZERO");
  }

  if (votingWeight > 100) {
    throw new Error("VOTING_WEIGHT_MUST_BE_LESS_THAN_OR_EQUAL_TO_100");
  }

  if (votingWeight === 100) {
    parsedVotingWeight = api.createType("OneOrPercent", { One: null });
  }

  return api.tx.inv4.setSubTokenWeight(
    parseInt(id),
    parseInt(subTokenId),
    parsedVotingWeight
  );
};

export { setSubTokenWeightMultisig };
