# Voting

### vote

The `vote` function allows a multisig member to vote on a pending multisig call. They can vote in favor or against the call.

**Example:**

```typescript
const id = 1;
const callHash =
  "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17";
const aye = true; // Vote in favor of the call

const voteResult = await saturn.vote({ id, callHash, aye });

// Sign and send the transaction
const voteTxHash = await voteResult.signAndSend(account);

console.log("Voted for multisig call with tx hash:", voteTxHash);
```

### withdrawVote

The `withdrawVote` function allows a multisig member to withdraw their vote on a pending multisig call. This can be useful if a member changes their mind or if the call's details have been updated.

**Example:**

```typescript
const id = 1;
const callHash =
  "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17";

const withdrawVoteResult = await saturn.withdrawVote({ id, callHash });

// Sign and send the transaction
const withdrawTxHash = await withdrawVoteResult.signAndSend(account);

console.log("Withdrawn vote for multisig call with tx hash:", withdrawTxHash);
```

Both functions return a `Promise<SubmittableResult>`. After signing and sending the transaction, the promise resolves with a `SubmittableResult`, which contains the transaction hash and other details.

The possible outcomes of the `vote` and `withdrawVote` functions depend on the status of the multisig call and the actions of the multisig members. Here are some possible outcomes for each function:

### vote

1. If the member has not voted yet and casts their vote, their vote will be recorded for the multisig call.
2. If the member has already voted and tries to vote again, the new vote will overwrite their previous vote.
3. If the multisig call has already been executed or canceled, the member's vote will have no effect on the outcome.

### withdrawVote

1. If the member has voted and withdraws their vote, their vote will be removed from the tally.
2. If the member has not voted and tries to withdraw their vote, there will be no change in the vote tally.
3. If the multisig call has already been executed or canceled, withdrawing the vote will have no effect on the outcome.

In both cases, the multisig call will be executed if it meets the minimum support and required approval thresholds based on the current votes. Conversely, if the call fails to meet the thresholds, it will not be executed. The multisig call can also be canceled by the original caller or any other member with the required privileges.

Please note that these outcomes depend on the actions and voting preferences of the multisig members, and the actual results might vary in different situations.
