# Multisig Query Functions Guide

This guide offers an overview of the various query functions for interacting with a multisig.

### 1. Get Multisig Details

The `getDetails` function retrieves key details about a multisig such as minimum support, required approval, and the total number of proposals made. Pass the multisig ID as an argument.

**Example:**

```typescript
const multisigId = 1; // Update with the actual multisig ID
const details = await saturn.getDetails(multisigId);

console.log("Multisig details:", details);
// Output: Multisig details: { minimumSupport: 3, requiredApproval: 2, proposalsCount: 5 }
```

### 2. Fetch Total Supply

The `getSupply` function returns the total supply of tokens within a multisig. Supply the multisig ID as an argument.

**Example:**

```typescript
const totalSupply = await saturn.getSupply(multisigId);

console.log("Multisig total supply:", totalSupply.toString());
// Output: Multisig total supply: 1000
```

### 3. List Pending Calls

Use the `getPendingCalls` function to get a list of all pending calls (unexecuted or un-rejected proposals) in a multisig. Pass the multisig ID as an argument.

**Example:**

```typescript
const pendingCalls = await saturn.getPendingCalls(multisigId);

console.log("Pending calls:", pendingCalls);
// Output: Pending calls: [ { callHash: '0x1234...', proposalId: 1, status: 'pending' }, { callHash: '0x5678...', proposalId: 2, status: 'pending' } ]
```

### 4. Get Specific Pending Call

The `getPendingCall` function fetches the details of a specific pending call in a multisig by using the call hash. Provide both the multisig ID and the call hash as arguments.

**Example:**

```typescript
const callHash = "0x12345..."; // Replace with actual call hash
const callDetails = await saturn.getPendingCall({ id: multisigId, callHash });

console.log("Pending call details:", callDetails);
// Output: Pending call details: { callHash: '0x1234...', proposalId: 1, status: 'pending', data: '...' }
```

### 5. List Multisig Members

The `getMultisigMembers` function returns a list of all members of a multisig. These are accounts eligible to vote on proposals. Provide the multisig ID as an argument.

**Example:**

```typescript
const members = await saturn.getMultisigMembers(multisigId);

console.log("Multisig members:", members);
// Output: Multisig members: [ '5D5Ph...', '5D5Ph...', '5D5Ph...' ]
```

### 6. Get Multisigs for a Specific Account

The `getMultisigsForAccount` function fetches all multisigs where a specific account is a member. Pass the account address as an argument.

**Example:**

```typescript
const accountAddress = "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu"; // Replace with actual account address
const accountMultisigs = await saturn.getMultisigsForAccount(accountAddress);

console.log("Multisigs for account:", accountMultisigs);
// Output: Multisigs for account: [ 1, 2, 3 ]
```

### 7. Get Voting Balance

for a Specific Account

The `getMultisigMemberBalance` function retrieves the voting balance of a specific account in a multisig. Provide both the multisig ID and the account address as arguments.

**Example:**

```typescript
const balance = await saturn.getMultisigMemberBalance({
  id: multisigId,
  address: accountAddress,
});

console.log("Multisig member balance:", balance.toString());
// Output: Multisig member balance: 500
```

These query functions provide an extensive set of tools for querying and managing a multisig. Their usage enables efficient data retrieval and multisig administration.
