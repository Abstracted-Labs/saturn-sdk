# Voting

## Cast Your Vote

The `vote` function in the Saturn library allows multisig members to express their support or opposition to a specific multisig call. The vote is recorded as either "aye" (in favor) or "nay" (against). This is determined by the boolean value provided in the function call. The multisig call can be executed once it has reached the required level of support and approval.

**Example:**

```typescript
// Example: Voting in favor of a multisig call
const voteAye = await saturn.vote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
  aye: true,
});

// Example: Voting against a multisig call
const voteNay = await saturn.vote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
  aye: false,
});
```

## Withdrawing Your Vote

The `withdrawVote` function allows a multisig member to retract their previous vote on a specific multisig call. Withdrawing a vote can alter the support and approval percentages for the multisig call, which may influence whether or not it's executed.

**Example:**

```typescript
// Example: Withdrawing your vote from a multisig call
const voteWithdraw = await saturn.withdrawVote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
});
```

In the examples above, `saturn` is an instance of the `Saturn` class. We are assuming that you have already connected to the Polkadot network and have a valid multisig ID and call hash. The `vote` function is used to cast a vote in favor or against a specific multisig call, while the `withdrawVote` function is used to retract a previous vote.

## Practical Example

Below is an example from our `/example` app, demonstrating how to submit a vote.

```typescript
const handleVoteSubmit = async (votingCallHash: string) => {
  const injector = await web3FromAddress(selectedAccount.address);

  const result = saturn
    .vote({ id, callHash: votingCallHash, aye: true })
    .signAndSend(selectedAccount.address, { signer: injector.signer });

  console.log(result);
};
```

You'll be able to verify if the voting action was successful by getting the MultisigCall result at the end.
