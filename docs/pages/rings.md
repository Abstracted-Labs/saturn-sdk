# XCM operations using the rings functions

These three functions allow you to interact with external chains and networks using cross-chain messaging (XCM) within the context of a multisig. They expand the capabilities of a multisigs, enabling them to interact with different chains and networks, and making them more versatile in a cross-chain environment.

1. `sendXCMCall`: This function sends a cross-chain message (XCM) from a multisig to an external destination. It is useful for making cross-chain calls like interacting with smart contracts or other parachains.

```typescript
const id = 1;
const destination = "0x1234..."; // External destination address
const weight = new BN(1000); // Weight of the call
const callData = "0x12345..."; // Call data in hex format
const feeAsset = {
  /* Fee asset object */
};
const fee = new BN(10); // Fee amount

await saturn.sendXCMCall({
  id,
  destination,
  weight,
  callData,
  feeAsset,
  fee,
});
```

2. `transferXcmAsset`: This function transfers an asset to an external destination using XCM. It is useful for sending assets to other parachains or relay chains.

```typescript
const id = 1;
const asset = {
  /* Asset object */
};
const amount = new BN(100); // Amount to transfer
const to = "0x1234..."; // Recipient's address
const feeAsset = {
  /* Fee asset object */
};
const fee = new BN(10); // Fee amount

await saturn.transferXcmAsset({
  id,
  asset,
  amount,
  to,
  feeAsset,
  fee,
});
```

3. `bridgeXcmAsset`: This function bridges an asset to an external destination using XCM. It is useful for sending assets to other chains or networks like Ethereum.

```typescript
const id = 1;
const asset = {
  /* Asset object */
};
const amount = new BN(100); // Amount to bridge
const destination = "0x1234..."; // External destination address
const to = "0x5678..."; // Optional recipient's address
const fee = new BN(10); // Fee amount

await saturn.bridgeXcmAsset({
  id,
  asset,
  amount,
  destination,
  to,
  fee,
});
```
