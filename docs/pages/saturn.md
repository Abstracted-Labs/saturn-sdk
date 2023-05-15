# Saturn

## Overview

Saturn is a powerful platform that allows users to create, manage, and interact with multisig accounts in a decentralized and secure manner. It offers a range of functionalities, including adding or removing members, voting on proposals, transferring assets, and bridging assets across different chains. Saturn aims to provide an intuitive and user-friendly interface for managing multisig accounts while prioritizing security and transparency.

The key features of Saturn include:

1. **Multisig Management**: Saturn enables users to create and manage multisig accounts with customizable parameters such as minimum support required for approval, required approval percentage, and token freezing options. Users can easily add or remove members, update multisig parameters, and view detailed information about their multisig accounts.

2. **Proposal System**: Saturn incorporates a built-in proposal system that allows members to propose and vote on various calls across connected chains. These calls can involve multisig management operations, such as adding or removing multisig members, as well as asset transfers and bridging operations. Members can vote on proposals, and the outcome is determined based on the configured parameters of the multisig account.

3. **Cross-chain Asset Management**: With Saturn, users can seamlessly manage assets across different chains. They can bridge assets from one chain to another, transfer assets between accounts on different chains, and monitor the XCM (Cross-Chain Messaging) status of various chains. This enables efficient and flexible asset management across multiple blockchain networks.

4. **Flexible Integration**: The Saturn SDK is designed to be easily integrated with various blockchain applications and platforms. Developers can leverage the powerful multisig capabilities of Saturn within their projects, enabling secure and decentralized management of assets and operations.

5. **Security and Transparency**: Saturn leverages the inherent security and transparency of blockchain technology. All actions performed within the platform are recorded on the blockchain, ensuring transparency and immutability. At the same time, Saturn prioritizes user privacy and control over their assets, providing a secure environment for managing multisig accounts.

Saturn's comprehensive set of features and user-friendly interface make it an ideal solution for a wide range of use cases, from decentralized organizations and consortiums to individual users seeking enhanced security and control over their digital assets.

## Methods

### [getDetails](https://saturn-typedocs.invarch.network/classes/Saturn.html#getDetails)

Retrieves the details of a multisig account.

```typescript
getDetails(id: number): Promise<MultisigDetails | null>
```

**Parameters:**

- `id` (number): The ID of the multisig account.

**Returns:**

A Promise that resolves to a `MultisigDetails` object representing the details of the multisig account, or `null` if the account does not exist.

### [getSupply](https://saturn-typedocs.invarch.network/classes/Saturn.html#getSupply)

Retrieves the total issuance of a multisig account.

```typescript
getSupply(id: number): Promise<BN>
```

**Parameters:**

- `id` (number): The ID of the multisig account.

**Returns:**

A Promise that resolves to a `BN` (Big Number) representing the total issuance of the multisig account.

### [getPendingCalls](https://saturn-typedocs.invarch.network/classes/Saturn.html#getPendingCalls)

Retrieves the pending calls for a multisig account.

```typescript
getPendingCalls(id: number): Promise<CallDetailsWithHash[]>
```

**Parameters:**

- `id` (number): The ID of the multisig account.

**Returns:**

A Promise that resolves to an array of `CallDetailsWithHash` objects representing the pending calls for the multisig account.

### [getPendingCall](https://saturn-typedocs.invarch.network/classes/Saturn.html#getPendingCall)

Retrieves the details of a pending multisig call.

```typescript
getPendingCall({
  id: number;
  callHash: string | Hash;
}): Promise<CallDetails | null>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `callHash` (string | Hash): The hash of the multisig call.

**Returns:**

A Promise that resolves to a `CallDetails` object representing the details of the pending multisig call, or `null` if the call is not found.

### [getMultisigMembers](https://saturn-typedocs.invarch.network/classes/Saturn.html#getMultisigMembers)

Retrieves the members of a multisig account.

```typescript
getMultisigMembers(id: number): Promise<AccountId[]>
```

**Parameters:**

- `id` (number): The ID of the multisig account.

**Returns:**

A Promise that resolves to an array of `AccountId` objects representing the members of the multisig account.

### [getMultisigsForAccount](https://saturn-typedocs.invarch.network/classes/Saturn.html#getMultisigsForAccount)

Retrieves the multisig accounts associated with an account.

```typescript
getMultisigsForAccount(account: string | AccountId): Promise<{ multisigId: number; tokens: BN }[]>
```

**Parameters:**

- `account` (string | AccountId): The address of the account.

**Returns:**

A Promise that resolves to an array of objects containing the `multisigId` and `tokens` associated with the account.

### [getMultisigMemberBalance](https://saturn-typedocs.invarch.network/classes/Saturn.html#getMultisigMemberBalance)

Retrieves the balance of a multisig member.

```typescript
getMultisigMemberBalance({
  id: number;
  address: string | AccountId;
}): Promise<BN>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `address` (string | AccountId): The address of the member.

**Returns:**

A Promise that resolves to a `BN` (Big Number) representing the balance of the multisig member.

### [setMultisigParameters](https://saturn-typedocs.invarch.network/classes/Saturn.html#setMultisigParameters)

Sets the parameters for a multisig account.

```typescript
setMultisigParameters({
  id: number;
  proposalMetadata: string | Uint8Array;
  metadata?: string | Uint8Array;
  minimumSupport: Perbill | BN | number;
  requiredApproval: Perbill | BN | number;
  frozenTokens: boolean;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `proposalMetadata` (string | Uint8Array): The metadata for the proposal.
- `metadata` (string | Uint8Array, optional): The metadata for the multisig account.
- `minimumSupport` (Perbill | BN | number): The minimum support required for approval.
- `requiredApproval` (Perbill | BN | number): The required approval percentage.
- `frozenTokens` (boolean): Indicates whether tokens should be frozen.

**Returns:**

A Promise that resolves to a `MultisigCall` object representing the call to set the multisig parameters.

### [proposeNewMember](https://saturn-typedocs.invarch.network)

```typescript
proposeNewMember({
  id: number;
  address: string | AccountId;
  amount: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `address` (string | AccountId): The address of the new member to be added.
- `amount` (BN): The amount of tokens to mint for the new member.
- `proposalMetadata` (string | Uint8Array, optional): The metadata for the proposal.

**Returns:**

A Promise that resolves to a `MultisigCall` object representing the call to propose adding a new member to the multisig account.

### [proposeMemberRemoval](https://saturn-typedocs.invarch.network/classes/Saturn.html#proposeMemberRemoval)

Proposes the removal of a member from a multisig account.

```typescript
proposeMemberRemoval({
  id: number;
  address: string | AccountId;
  amount: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `address` (string | AccountId): The address of the member to be removed.
- `amount` (BN): The amount of tokens to burn from the member.
- `proposalMetadata` (string | Uint8Array, optional): The metadata for the proposal.

**Returns:**

A Promise that resolves to a `MultisigCall` object representing the call to propose removing a member from the multisig account.

### [vote](https://saturn-typedocs.invarch.network/classes/Saturn.html#vote)

Votes on a multisig call.

```typescript
vote({
  id: number;
  callHash: string | Hash;
  aye: boolean;
}): Promise<SubmittableResult>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `callHash` (string | Hash): The hash of the multisig call.
- `aye` (boolean): Specifies whether to vote in favor (`true`) or against (`false`) the multisig call.

**Returns:**

A Promise that resolves to a `SubmittableResult` object representing the result of the vote.

### [withdrawVote](https://saturn-typedocs.invarch.network/classes/Saturn.html#withdrawVote)

Withdraws a vote for a multisig call.

```typescript
withdrawVote({
  id: number;
  callHash: string | Hash;
}): Promise<SubmittableResult>
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `callHash` (string | Hash): The hash of the multisig call.

**Returns:**

A Promise that resolves to a `SubmittableResult` object representing the result of withdrawing the vote.

### [buildMultisigCall](https://saturn-typedocs.invarch.network/classes/Saturn.html#buildMultisigCall)

Builds a multisig call object.

```typescript
buildMultisigCall({
  id: number;
  proposalMetadata?: string | Uint8Array;
  call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
}): MultisigCall
```

**Parameters:**

- `id` (number): The ID of the multisig account.
- `proposalMetadata` (string | Uint8Array, optional): The metadata for
