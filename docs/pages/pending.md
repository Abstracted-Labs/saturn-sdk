# Retrieving Pending Calls

The `getPendingCalls` function serves to extract a list of pending multisig calls associated with a given multisig ID.

**Usage:**

```typescript
const pendingCalls = await saturn.getPendingCalls(multisigId);
```

In the above example, `multisigId` is the ID of the multisig for which you want to retrieve pending calls.

**Returned Value:**

The function returns an array of objects, where each object represents a pending call with the following properties:

- `callHash`: A unique identifier for the call.
- `details`: An object containing information about the call.

Here's an example of the returned data:

```typescript
[
  {
    callHash:
      "0x6d83b6f34d6f4738e2730c1d68cfa35e03c2a8f76f5b4e4d4db3ad07c68a1e17",
    details: {
      id: 1,
      tally: {
        ayes: new BN("500"),
        nays: new BN("100"),
      },
      originalCaller: "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi",
      actualCall: {
        methodName: "transfer",
        args: {
          to: "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
          value: new BN("1000"),
        },
      },
      proposalMetadata: "Transfer funds to team member",
    },
  },
  {
    callHash:
      "0x8f7e0f0b61ff2cd2c41b71e0b87e69a0f9d9c8b8edfdbc3dd3d3d0f4766c533a",
    details: {
      id: 1,
      tally: {
        ayes: new BN("400"),
        nays: new BN("200"),
      },
      originalCaller: "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi",
      actualCall: {
        methodName: "proposeNewMember",
        args: {
          address: "5F3LQNi8fFEujxEYrVrPvYgYRd8Y5x5J7z5DwHzdM7L66eJc",
          amount: new BN("500"),
        },
      },
      proposalMetadata: "Add new member to multisig",
    },
  },
];
```

In this example, `ayes` and `nays` are the current number of approvals and disapprovals for the call, respectively. `originalCaller` is the account that initiated the call, `methodName` is the function to be executed, and `args` are the arguments to be passed to that function. `proposalMetadata` is an optional field where you can provide additional information about the proposal.

By utilizing `getPendingCalls`, you can keep track of all pending actions that require approval within your multisig.
