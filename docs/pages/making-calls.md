# Transfer XCM Asset

`transferXcmAsset` is a function that transfers assets across different parachains using the XCM (Cross-Chain Message) protocol. It takes the necessary parameters to transfer assets and returns a success or failure message.

**Parameters:**

1. `sender`: The account initiating the transfer.
2. `destination`: The address of the recipient.
3. `asset`: The asset to be transferred.
4. `amount`: The amount of the asset to be transferred.

**Returns:**

A success or failure message, indicating the result of the transfer.

**Example Usage:**

```javascript
const transferResult = await transferXcmAsset(
  sender,
  destination,
  asset,
  amount
);
console.log(transferResult);
```
