# Voting

### Vote

The `vote` function allows a multisig member to express their support or opposition to a specific multisig call. The vote is recorded as either "aye" (in favor) or "nay" (against), depending on the boolean value provided. Once the multisig call reaches the required level of support and approval, it can be executed.

**Example:**

```typescript
// Vote in favor of a multisig call
await saturn.vote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
  aye: true,
});

// Vote against a multisig call
await saturn.vote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
  aye: false,
});
```

### Withdraw Vote

The `withdrawVote` function allows a multisig member to cancel their previous vote on a specific multisig call. Withdrawing a vote can change the support and approval percentages for the multisig call, potentially affecting its execution.

**Example:**

```typescript
// Withdraw your vote from a multisig call
await saturn.withdrawVote({
  id: 1,
  callHash:
    "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
});
```

In the examples above, `saturn` is an instance of the `Saturn` class, and we assume that you have already connected to the Polkadot network and have a valid multisig ID and call hash. The `vote` function is used to cast a vote in favor or against a specific multisig call, while the `withdrawVote` function is used to cancel a previous vote.

### Example

This is a real example that can be found on our `/example` app.

```typescript
const handleVoteSubmit = async (votingCallHash: string) => {
  const injector = await web3FromAddress(selectedAccount.address);

  saturn
    .vote({ id, callHash: votingCallHash, aye: true })
    .signAndSend(
      selectedAccount.address,
      { signer: injector.signer },
      ({ events }) => {
        console.log(events.map((event) => event.toHuman()));
      }
    );
};
```

You'll be able to see if the result was successfull by finding the successful event.
