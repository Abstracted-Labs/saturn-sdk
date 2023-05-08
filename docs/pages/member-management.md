# Overview of the query functions

## Propose a new member

To propose adding a new member to the multisig, you can use the proposeNewMember function. The function accepts the multisig ID, the new member's address, and the initial amount of tokens for the new member's balance.

```typescript
const UNIQUE_SUPPLY_AMOUNT = new BN("1000000");

const address = selectedAccount.address;
const signer = (await web3FromAddress(address)).signer;

saturn
  .proposeNewMember({
    id,
    address: newMember,
    amount: UNIQUE_SUPPLY_AMOUNT,
  })
  .signAndSend(address, signer);
```

## Propose member removal

To propose the removal of a member from the multisig, you can use the proposeMemberRemoval function. The function accepts the multisig ID and the address of the member to be removed.

```typescript
const address = selectedAccount.address;
const signer = (await web3FromAddress(address)).signer;

const amount = await saturn.getMultisigMemberBalance({
  id,
  address: memberToRemove,
});

saturn
  .proposeMemberRemoval({
    amount,
    id,
    address: memberToRemove,
  })
  .signAndSend(address, signer);
```
