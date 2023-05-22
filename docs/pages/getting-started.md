# Setting up a `Saturn` Instance

Getting started with the Saturn Software Development Kit (SDK) is like unlocking a toolbox. Each tool within the toolbox corresponds to a different functionality you can leverage to manage multisigs. To begin, you first need to unlock this toolbox by instantiating a `Saturn` class object.

## 1. Importing Dependencies:

Your journey starts with gathering your tools. The required classes and functions from the SDK are your keys:

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Saturn } from "@invarch/saturn-sdk";
```

Think of `ApiPromise` and `WsProvider` as your tool connectors, which are imported from the `@polkadot/api` package. Meanwhile, `Saturn` is your main toolbox from the `saturn-sdk` package.

## 2. Connecting to Tinkernet/InvArch:

Now it's time to connect your tools to the workbench, Tinkernet/InvArch, by establishing a connection using an instance of `ApiPromise`.

```typescript
const wsProvider = new WsProvider(
  "wss://invarch-tinkernet.api.onfinality.io/public-ws"
);
const api = await ApiPromise.create({ provider: wsProvider });
```

In this step, imagine constructing a communication bridge (WebSocket provider) with the address of your node and passing it to the `ApiPromise.create()` method to form a robust connection.

## 3. Instantiating the Saturn Class:

You're ready to unlock the toolbox! Create an instance of the `Saturn` class by using your connection (`api` object) as the key.

```typescript
const saturn = new Saturn({ api });
```

## 4. Ready to Roll:

Kudos! Your toolbox (Saturn instance) is now unlocked. You can utilize the SDK to create and manage multisigs. Picture each task you perform as using a different tool from this box.

Remember, ensuring your workbench (node URL) is set up correctly and your bridge (connection) is sturdy before you start using your tools is vital. Any missteps here could cause your tools (methods in the SDK) to malfunction.

Continuing this analogy, the following documentation sections will guide you on how to wield these tools effectively and get the job done.

Here are some of the methods available in the `Saturn` class:

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
- `proposalMetadata` (string | Uint8Array, optional): Optional metadata for the multisig proposal.
