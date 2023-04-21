# Overview of the query functions

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
