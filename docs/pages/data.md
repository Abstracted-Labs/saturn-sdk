# Data related to the multisig

## Details

```typescript
const rawDetails = await saturn.getDetails(id);

// rawDetails can be null, as the "id" can be any string

if (!rawDetails) throw new Error("ID not found");

const details = rawDetails.toHuman();
```

The `toHuman` method of the `MultisigDetails` class returns an object with more human-readable representations of the multisig details. Here's an example of the output based on the previous `MultisigDetails` example:

```typescript
{
  id: 1,
  account: "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi",
  metadata: "Example Multisig",
  minimumSupport: "50.00%", // assuming a minimumSupport Perbill value of 500,000,000
  requiredApproval: "70.00%", // assuming a requiredApproval Perbill value of 700,000,000
  frozenTokens: false,
  totalIssuance: "3500",
}
```

The `toHuman` method transforms the original values into more readable formats:

- `id`: The multisig's unique identifier remains the same (1).
- `account`: The `AccountId` is converted to its string representation.
- `metadata`: The metadata string remains the same ("Example Multisig").
- `minimumSupport`: The `Perbill` value of minimum support is converted to a percentage string representation (e.g., "50.00%").
- `requiredApproval`: The `Perbill` value of required approval is converted to a percentage string representation (e.g., "70.00%").
- `frozenTokens`: The boolean value remains the same (false).
- `totalIssuance`: The `BN` (Big Number) value is converted to its string representation ("3500").

## Members

```typescript
await saturn.getMultisigMembers(id);
```

```typescript
["i52fucAbyb8FxttgXjALRAK2fKzv67kBBSpELCFDGXpv6TTzB"];
```
