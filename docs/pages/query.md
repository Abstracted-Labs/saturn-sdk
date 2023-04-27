# Overview of the query functions

### Get multisig details

This function retrieves the details of a multisig, such as minimum support, required approval, and the total number of proposals made. Pass the multisig ID as an argument.

```typescript
const details = await saturn.getDetails(id);

console.log("Multisig details:", details);
```

### Get total supply

This function returns the total supply of tokens in a multisig. Pass the multisig ID as an argument.

```typescript
const supply = await saturn.getSupply(id);

console.log("Multisig total supply:", supply.toString());
```

### Get pending calls

This function returns the list of all pending calls in a multisig, which are proposals that have not yet been executed or rejected. Pass the multisig ID as an argument.

```typescript
const pendingCalls = await saturn.getPendingCalls(id);

console.log("Pending calls:", pendingCalls);
```

### Get pending call

This function retrieves the details of a specific pending call in a multisig using the call hash. Pass the multisig ID and the call hash as arguments.

```typescript
const callHash = "0x12345...";

const callDetails = await saturn.getPendingCall({ id, callHash });

console.log("Pending call details:", callDetails);
```

### Get multisig members

This function returns a list of all members of a multisig, which are accounts that can vote on proposals. Pass the multisig ID as an argument.

```typescript
const members = await saturn.getMultisigMembers(id);

console.log("Multisig members:", members);
```

### Get all the multisigs of a specific address

This function retrieves all multisigs where a specific account is a member. Pass the account address as an argument.

```typescript
const multisigs = await saturn.getMultisigsForAccount(account);

console.log("Multisigs for account:", multisigs);
```

### Get the balance of a specific account

This function returns the balance of a specific account in a multisig. Pass the multisig ID and the address of the account as arguments.

```typescript
const balance = await saturn.getMultisigMemberBalance({
  id,
  address,
});

console.log("Multisig member balance:", balance.toString());
```
