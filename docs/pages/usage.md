# Usage

### Create a multisig

```ts
const wsProvider = new WsProvider(host);

const accounts = await web3Accounts();

const api = await ApiPromise.create({ provider: wsProvider });

const selectedAccount = accounts[0];

const saturn = new Saturn({ api });

const injector = await web3FromAddress(selectedAccount.address);

const multisig = await saturn
  .createMultisig({
    minimumSupport: 510000000,
    requiredApproval: 510000000,
  })
  .signAndSend(selectedAccount.address, injector.signer);
```

## Queries

### Get multisig details

```typescript
const details = await saturn.getDetails(id);

console.log("Multisig details:", details);
```

### Get total supply

```typescript
const supply = await saturn.getSupply(id);

console.log("Multisig total supply:", supply.toString());
```

### Get pending calls

```typescript
const pendingCalls = await saturn.getPendingCalls(id);

console.log("Pending calls:", pendingCalls);
```

### Get pending call

```typescript
const callHash = "0x12345...";

const callDetails = await saturn.getPendingCall({ id, callHash });

console.log("Pending call details:", callDetails);
```

### Get multisig members

```typescript
const members = await saturn.getMultisigMembers(id);

console.log("Multisig members:", members);
```

### Get all the multisigs of a specific address

```typescript
const multisigs = await saturn.getMultisigsForAccount(account);

console.log("Multisigs for account:", multisigs);
```

### Get the balance of a specific account

```typescript
const balance = await saturn.getMultisigMemberBalance({
  id,
  address,
});

console.log("Multisig member balance:", balance.toString());
```

## Wrapped Multisig Calls

### Propose a new member

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

### Propose member removal

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
