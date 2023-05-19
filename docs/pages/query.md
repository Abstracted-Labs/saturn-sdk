# Query Functions Overview

This document provides an overview of the query functions available for interacting with a multisig.

### Retrieve Multisig Details

The `getDetails` function allows you to obtain specific details about a multisig, such as minimum support, required approval, and the total number of proposals made. You will need to provide the multisig ID as an argument.

**Usage:**

```typescript
const multisigId = 1; // replace with actual multisig ID
const details = await saturn.getDetails(multisigId);

console.log("Multisig details:", details);
```

### Retrieve Total Supply

You can use the `getSupply` function to return the total supply of tokens within a multisig. Again, you will need to provide the multisig ID as an argument.

**Usage:**

```typescript
const totalSupply = await saturn.getSupply(multisigId);

console.log("Multisig total supply:", totalSupply.toString());
```

### List Pending Calls

The `getPendingCalls` function is used to retrieve a list of all pending calls in a multisig. These are proposals that are yet to be executed or rejected. You need to provide the multisig ID as an argument.

**Usage:**

```typescript
const pendingCalls = await saturn.getPendingCalls(multisigId);

console.log("Pending calls:", pendingCalls);
```

### Retrieve Specific Pending Call

To fetch the details of a specific pending call in a multisig using the call hash, you can use the `getPendingCall` function. You will need to provide the multisig ID and the call hash as arguments.

**Usage:**

```typescript
const callHash = "0x12345..."; // replace with actual call hash
const callDetails = await saturn.getPendingCall({ id: multisigId, callHash });

console.log("Pending call details:", callDetails);
```

### Retrieve Multisig Members

The `getMultisigMembers` function returns a list of all members of a multisig. These are accounts that are eligible to vote on proposals. You need to provide the multisig ID as an argument.

**Usage:**

```typescript
const members = await saturn.getMultisigMembers(multisigId);

console.log("Multisig members:", members);
```

### Retrieve All Multisigs for a Specific Account

You can use the `getMultisigsForAccount` function to fetch all multisigs where a specific account is a member. You will need to provide the account address as an argument.

**Usage:**

```typescript
const accountAddress = "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu"; // replace with actual account address
const accountMultisigs = await saturn.getMultisigsForAccount(accountAddress);

console.log("Multisigs for account:", accountMultisigs);
```

### Retrieve Voting Balance of a Specific Account

The `getMultisigMemberBalance` function allows you to retrieve the voting balance of a specific account in a multisig. You will need to provide the multisig ID and the address of the account as arguments.

**Usage:**

```typescript
const balance = await saturn.getMultisigMemberBalance({
  id: multisigId,
  address: accountAddress,
});

console.log("Multisig member balance:", balance.toString());
```

These query functions collectively provide you with comprehensive tools for interacting with and managing a multisig.
