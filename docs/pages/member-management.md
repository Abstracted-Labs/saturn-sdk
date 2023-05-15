# Overview of the Query Functions

## Proposing a New Member

If you wish to propose the addition of a new member to the multisig, you can utilize the `proposeNewMember` function. This function takes in the multisig ID, the prospective member's address, and the initial balance of tokens for the new member.

Here is an example of how to use the `proposeNewMember` function:

```typescript
// Define the initial balance for the new member
const initialBalance = new BN("1000000");

// Assign the current account's address
const senderAddress = selectedAccount.address;

// Get the signer associated with the current account
const signer = (await web3FromAddress(senderAddress)).signer;

// Propose a new member to the multisig
saturn
  .proposeNewMember({
    id: multisigId,
    address: newMemberAddress,
    amount: initialBalance,
  })
  .signAndSend(senderAddress, signer);
```

In this example, `multisigId` is the ID of the multisig to which you want to add a new member, and `newMemberAddress` is the address of the account you want to add to the multisig.

## Proposing Member Removal

If you need to propose the removal of a member from the multisig, you can make use of the `proposeMemberRemoval` function. This function requires the multisig ID and the address of the member you wish to remove.

Here's an example of how to use the `proposeMemberRemoval` function:

```typescript
// Assign the current account's address
const senderAddress = selectedAccount.address;

// Get the signer associated with the current account
const signer = (await web3FromAddress(senderAddress)).signer;

// Retrieve the balance of the member to be removed
const memberBalance = await saturn.getMultisigMemberBalance({
  id: multisigId,
  address: memberToRemoveAddress,
});

// Propose the removal of a member from the multisig
saturn
  .proposeMemberRemoval({
    id: multisigId,
    address: memberToRemoveAddress,
    amount: memberBalance,
  })
  .signAndSend(senderAddress, signer);
```

In this example, `multisigId` is the ID of the multisig from which you want to remove a member, and `memberToRemoveAddress` is the address of the member you want to remove. The `amount` field should contain the balance of the member to be removed, which can be retrieved using the `getMultisigMemberBalance` function.
