# Retrieving Multisig Data

This guide will walk you through the process of retrieving and interpreting data associated with a multisig.

## 1. Retrieving Details of the Multisig:

You can fetch the details of a multisig by invoking the `getDetails` method on the `saturn` object and passing the multisig's unique identifier (id) as an argument.

```typescript
// Ensure the id is defined and not an empty string
if (!id) throw new Error("Invalid ID");

const rawDetails = await saturn.getDetails(id);

// The id could be any string, hence rawDetails may be null if the id does not exist
if (!rawDetails) throw new Error("ID not found");

const details = rawDetails.toHuman();
```

The `toHuman` method, which is a part of the `MultisigDetails` class, returns an object providing a more human-readable representation of the multisig details. The example below demonstrates the expected output based on the previous `MultisigDetails` example:

```typescript
{
  id: 1,
  account: "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi",
  metadata: "Example Multisig",
  minimumSupport: "50.00%", // Assuming a minimumSupport Perbill value of 500,000,000
  requiredApproval: "70.00%", // Assuming a requiredApproval Perbill value of 700,000,000
  frozenTokens: false,
  totalIssuance: "3500",
}
```

The `toHuman` method converts the original values into more comprehensible formats:

- `id`: The unique identifier of the multisig, remains unchanged (1 in this example).
- `account`: The `AccountId` is converted to its string representation.
- `metadata`: The metadata string remains unchanged ("Example Multisig" in this example).
- `minimumSupport`: The `Perbill` value of minimum support is converted into a percentage in string format (e.g., "50.00%").
- `requiredApproval`: The `Perbill` value of required approval is converted into a percentage in string format (e.g., "70.00%").
- `frozenTokens`: The boolean value remains unchanged (false in this example).
- `totalIssuance`: The `BN` (Big Number) value is converted into its string representation ("3500" in this example).

## 2. Retrieving Members of the Multisig:

The `getMultisigMembers` method of the `saturn` object returns the members of the multisig. This method requires the multisig's unique identifier (id) as an argument.

```typescript
// Ensure the id is defined and not an empty string
if (!id) throw new Error("Invalid ID");

const members = await saturn.getMultisigMembers(id);

if (!members) throw new Error("No members found for this ID");
```

The output is an array containing the `AccountId` of each member of the multisig:

```typescript
["i52fucAbyb8FxttgXjALRAK2fKzv67kBBSpELCFDGXpv6TTzB"];
```

Remember, data retrieved from the `saturn` object may be null if the id provided does not exist. Therefore, always check for null or undefined values before proceeding with
