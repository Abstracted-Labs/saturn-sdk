# Multisig Class

### getDetails

Get the details of a multisig.

```typescript
public getDetails(id: number): Promise<MultisigDetails | null>
```

**Parameters:**

- `id` (number): The multisig ID.

**Returns:**

A Promise that resolves to a MultisigDetails object or null.

### getSupply

Get the total issuance of a multisig.

```typescript
public getSupply(id: number): Promise<BN>
```

**Parameters:**

- `id` (number): The multisig ID.

**Returns:**

A Promise that resolves to a BN representing the total issuance.

### getPendingCalls

Get the pending calls for a multisig.

```typescript
public getPendingCalls(id: number): Promise<{ callHash: Hash; details: CallDetails }[]>
```

**Parameters:**

- `id` (number): The multisig ID.

**Returns:**

A Promise that resolves to an array of objects containing the callHash and CallDetails.

### getPendingCall

Get the details of a pending multisig call.

```typescript
public getPendingCall({
  id: number;
  callHash: string | Hash;
}): Promise<CallDetails | null>
```

**Parameters:**

- `id` (number): The multisig ID.
- `callHash` (string | Hash): The hash of the multisig call.

**Returns:**

A Promise that resolves to a CallDetails object or null.

### getMultisigMembers

Get the members of a multisig.

```typescript
public getMultisigMembers(id: number): Promise<AccountId[]>
```

**Parameters:**

- `id` (number): The multisig ID.

**Returns:**

A Promise that resolves to an array of AccountId objects.

### getMultisigsForAccount

Get the multisigs associated with an account.

```typescript
public getMultisigsForAccount(account: string | AccountId): Promise<{ multisigId: number; tokens: BN }[]>
```

**Parameters:**

- `account` (string | AccountId): The account address.

**Returns:**

A Promise that resolves to an array of objects containing the multisigId and tokens.

### getMultisigMemberBalance

Get the balance of a multisig member.

```typescript
public getMultisigMemberBalance({
  id: number;
  address: string | AccountId;
}): Promise<BN>
```

**Parameters:**

- `id` (number): The multisig ID.
- `address` (string | AccountId): The member's address.

**Returns:**

A Promise that resolves to a BN representing the member's balance.

### proposeNewMember

Propose adding a new member to a multisig.

```typescript
public proposeNewMember({
  id: number;
  address: string | AccountId;
  amount: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `address` (string | AccountId): The address of the new member.
- `amount` (BN): The amount of tokens to mint for the new member.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.

**Returns:**

A Promise that resolves to a MultisigCall object.

### proposeMemberRemoval

Propose removing a member from a multisig.

```typescript
public proposeMemberRemoval({
  id: number;
  address: string | AccountId;
  amount: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `address` (string | AccountId): The address of the member to remove.
- `amount` (BN): The amount of tokens to burn from the member.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.

**Returns:**

A Promise that resolves to a MultisigCall object.

### vote

Vote on a multisig call.

```typescript
public vote({
  id: number;
  callHash: string | Hash;
  aye: boolean;
}): Promise<SubmittableResult>
```

**Parameters:**

- `id` (number): The multisig ID.
- `callHash` (string | Hash): The hash of the multisig call.
- `aye` (boolean): `true` to vote in favor, `false` to vote against.

**Returns:**

A Promise that resolves to a SubmittableResult.

### withdrawVote

Withdraw a vote for a multisig call.

```typescript
public withdrawVote({
  id: number;
  callHash: string | Hash;
}): Promise<SubmittableResult>
```

**Parameters:**

- `id` (number): The multisig ID.
- `callHash` (string | Hash): The hash of the multisig call.

**Returns:**

A Promise that resolves to a SubmittableResult.

### buildMultisigCall

Build a multisig call object.

```typescript
public buildMultisigCall({
  id: number;
  proposalMetadata?: string | Uint8Array;
  call: SubmittableExtrinsic<ApiTypes> | Uint8Array | Call;
}): MultisigCall
```

**Parameters:**

- `id` (number): The multisig ID.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.
- `call` (SubmittableExtrinsic<ApiTypes> | Uint8Array | Call): The call to be executed.

**Returns:**

A MultisigCall object.

### sendXCMCall

Create and send an XCM call.

```typescript
public sendXCMCall({
  id: number;
  destination: string;
  weight: BN;
  callData: string | Uint8Array;
  feeAsset: Object;
  fee: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `destination` (string): The destination chain.
- `weight` (BN): The weight of the call.
- `callData` (string | Uint8Array): The call data.
- `feeAsset` (Object): The asset used for fees.
- `fee` (BN): The fee amount.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.

**Returns:**

A Promise that resolves to a MultisigCall object.

### transferXcmAsset

Create and send an XCM asset transfer.

```typescript
public transferXcmAsset({
  id: number;
  asset: Object;
  amount: BN;
  to: string | AccountId;
  feeAsset: Object;
  fee: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `asset` (Object): The asset to be transferred.
- `amount` (BN): The amount to be transferred.
- `to` (string | AccountId): The recipient's address.
- `feeAsset` (Object): The asset used for fees.
- `fee` (BN): The fee amount.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.

**Returns:**

A Promise that resolves to a MultisigCall object.

### bridgeXcmAsset

Bridge an asset from one chain to another.

```typescript
public bridgeXcmAsset({
  id: number;
  asset: Object;
  amount: BN;
  destination: string;
  to: string | AccountId;
  fee: BN;
  proposalMetadata?: string | Uint8Array;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `asset` (Object): The asset to bridge.
- `amount` (BN): The amount of the asset to bridge.
- `destination` (string): The destination chain.
- `to` (string | AccountId): The recipient address on the destination chain.
- `fee` (BN): The fee for the transaction.
- `proposalMetadata` (string | Uint8Array, optional): The proposal metadata.

**Returns:**

A Promise that resolves to a MultisigCall object.

### setMultisigParameters

Set the parameters for a multisig.

```typescript
public setMultisigParameters({
  id: number;
  proposalMetadata: string | Uint8Array;
  metadata?: string | Uint8Array;
  minimumSupport: Perbill | BN | number;
  requiredApproval: Perbill | BN | number;
  frozenTokens: boolean;
}): Promise<MultisigCall>
```

**Parameters:**

- `id` (number): The multisig ID.
- `proposalMetadata` (string | Uint8Array): The proposal metadata.
- `metadata` (string | Uint8Array, optional): The multisig metadata.
- `minimumSupport` (Perbill | BN | number): The minimum support required for approval.
- `requiredApproval` (Perbill | BN | number): The required approval percentage.
- `frozenTokens` (boolean): Whether tokens should be frozen.

**Returns:**

A Promise that resolves to a MultisigCall object.

### getXcmStatus

Get the XCM status of chains.

```typescript
public async getXcmStatus(): Promise<{
  chainMultilocation: XcmV1MultiLocation;
  isUnderMaintenance: boolean;
}[]>
```

**Returns:**

A Promise that resolves to an array of objects containing the chain multilocation and the maintenance status.