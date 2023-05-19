# XCM Operations with Rings Functions

Rings functions provide the ability to interact with external chains and networks using Cross-Chain Messaging (XCM) within the context of a multisig. They extend the capabilities of multisigs, enabling them to interface with different chains and networks, thus increasing their versatility in a cross-chain environment.

These functions all return a `MultisigCallResult`.

1. **Send XCM Call**

   `sendXCMCall` is a function that sends a cross-chain message (XCM) from a multisig to an external destination. It can be utilized for making cross-chain interactions such as interacting with smart contracts or other parachains.

   **Parameters:**

   - `id`: The multisig ID.
   - `destination`: The external destination address.
   - `weight`: The weight of the call.
   - `callData`: The call data in hexadecimal format.
   - `feeAsset`: The asset used for fee.
   - `fee`: The fee amount.

   **Usage:**

   ```typescript
   const id = 1;
   const destination = "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi";
   const weight = new BN(1000);
   const callData = "0x12345...";
   const feeAsset = FeeAsset.TNKR;
   const fee = new BN(10);

   const result = await saturn
     .sendXCMCall({
       id,
       destination,
       weight,
       callData,
       feeAsset,
       fee,
     })
     .signAndSend(address, signer);
   ```

2. **Transfer XCM Asset**

   `transferXcmAsset` is a function that transfers an asset to an external destination using XCM. This is useful for sending assets to other parachains or relay chains.

   **Parameters:**

   - `id`: The multisig ID.
   - `asset`: The asset to be transferred.
   - `amount`: The amount to be transferred.
   - `to`: The recipient's address.
   - `feeAsset`: The asset used for fee.
   - `fee`: The fee amount.

   **Usage:**

   ```typescript
   const id = 1;
   const asset = "KSM";
   const amount = new BN(100);
   const to = "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi";
   const feeAsset = FeeAsset.TNKR;
   const fee = new BN(10);

   const result: MultisigCallResult = await saturn
     .transferXcmAsset({
       id,
       asset,
       amount,
       to,
       feeAsset,
       fee,
     })
     .signAndSend(address, signer);
   ```

3. **Bridge XCM Asset**

   `bridgeXcmAsset` is a function that bridges an asset to an external destination using XCM. This is useful for sending assets to other chains or networks, such as Ethereum.

   **Parameters:**

   - `id`: The multisig ID.
   - `asset`: The asset to be bridged.
   - `amount`: The amount to be bridged.
   - `destination`: The external destination address.
   - `to`: The optional recipient's address.
   - `fee`: The fee amount.

   **Usage:**

   ```typescript
   const id = 1;
   const asset = "KSM";
   const amount = new BN(100);
   const destination = "Basilisk";
   const fee = new BN("2000000000000");

   const result = await saturn
     .bridgeXcmAsset({
       id,
       asset,
       amount,
       destination: "Basilisk",
       fee: new BN("2000000000000"),
       proposalMetadata: "bridge",
     })
     .signAndSend(address, signer);
   ```
