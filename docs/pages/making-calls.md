# Transfer XCM Asset

The `transferXcmAsset` function facilitates the transfer of assets across various parachains using the XCM (Cross-Chain Message) protocol. This document provides an overview of the parameters necessary for the transfer and how to interpret the function's return value.

## Parameters:

- `sender`: This is the account address initiating the transfer. It should be a valid account identifier string in the corresponding blockchain network format.

- `destination`: This refers to the recipient's account address. Similar to the `sender`, it should be a valid account identifier string.

- `asset`: This parameter identifies the asset to be transferred. It should be a string representing the asset's symbol or ID.

- `amount`: This parameter specifies the amount of the asset to be transferred. This should be a number, BN (Big Number), or a string that can be parsed into a number.

## Return Value:

Upon execution, the function returns a message indicating the outcome of the transfer. It could be a success message if the transfer was successful, or a failure message detailing the reason for the transfer failure.

## Example Usage:

The following example demonstrates how to use the `transferXcmAsset` function. In this scenario, the function transfers 100 units of the asset 'KSM' from the sender's account to the recipient's account.

```javascript
const sender = "5D5PhZQNJzcJXVBxwJxZcsaNWf5eV2XBZFreiSdbrfNy2Hvi";
const destination = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
const asset = "KSM";
const amount = 100;

try {
  const transferResult = await transferXcmAsset(
    sender,
    destination,
    asset,
    amount
  );

  console.log(transferResult);
} catch (error) {
  console.error(`Transfer failed with error: ${error}`);
}
```

In the example above, we wrapped the function call in a try-catch block to handle any potential errors that might occur during the execution of the transfer.

Please note that the provided `sender`, `destination`, and `asset` values are just examples. Replace them with actual values corresponding to your use case when implementing this in your application.
