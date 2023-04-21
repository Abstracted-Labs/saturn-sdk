# Data related to the multisig

## Details

```typescript
await saturn.getDetails(id);
```

**Returns**

```typescript
{
    "id": 0,
    "account": "i4z5fzqMNt4uDxeKd6o3Z2C7PeqpMtgsJAhkmZ9EJ3HJFfjza",
    "metadata": "0x",
    "minimumSupport": "0x1e65fb80",
    "requiredApproval": "0x1e65fb80",
    "frozenTokens": true,
    "totalIssuance": "0x000000000000000000000000000f4240"
}
```

**Usage**

```typescript
const minimumSupport = api.registry
  .createType("Perbill", details.minimumSupport.toNumber())
  .toHuman();

// 51.00%
```

## Members

```typescript
await saturn.getMultisigMembers(id);
```

**Returns**

```typescript
["i52fucAbyb8FxttgXjALRAK2fKzv67kBBSpELCFDGXpv6TTzB"];
```
