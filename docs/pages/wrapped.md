# Overview of the query functions

## Propose a new member

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
