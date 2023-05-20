# Creating a Multisig

A multisig is a blockchain primitive that requires multiple approvals to authorize transactions. This guide presents a step-by-step procedure to create a multisig using the Saturn in TypeScript.

## 1. Initiating a new multisig:

To generate a new multisig, call the `createMultisig` method on the `Saturn` class. This method accepts the following parameters:

- `metadata`: An arbitrary vector of bytes, can be used as a string or as raw bytes. This metadata can later be leveraged in your decentralized application (dApp).
- `minimumSupport`: The minimum ratio of positive votes to the total supply of vote tokens. Accepts values in `Perbill`, `BN`, or number formats.
- `requiredApproval`: The minimum ratio of positive to negative votes. Accepts `Perbill`, `BN`, or number.
- `feeAsset`: Imported from the multisig as `FeeAsset`, this enum can be used as `FeeAsset.TNKR` or `FeeAsset.KSM`.

Below is a sample code block demonstrating the creation of a multisig:

```typescript
const metadata = JSON.stringify({ name: "Super Multisig" });
const minimumSupport = 500000000; // Corresponding to 50% support;
const requiredApproval = 600000000; // Corresponding to 60% approval;
const feeAsset = FeeAsset.TNKR;

const injector = await web3FromAddress(selectedAccount.address);

const multisig = await saturn
  .createMultisig({
    metadata,
    minimumSupport,
    requiredApproval,
    feeAsset,
  })
  .signAndSend(selectedAccount.address, injector.signer);
```

## 2. Verifying the multisig creation:

Once the multisig is created, the `createMultisig` method returns a Promise that resolves to the multisig ID. You can log this ID to the console to confirm the creation of the multisig.

```typescript
console.log("Multisig created with ID:", multisig.id);
```

After successfully creating the multisig, you can use other methods provided by the `Saturn` class to manage and interact with the multisig, such as proposing new members, removing existing members, and voting on proposals.

Here's the complete example:

```typescript
const accounts = await web3Accounts();

const selectedAccount = accounts[0];

const injector = await web3FromAddress(selectedAccount.address);

const multisig = await saturn
  .createMultisig({
    // metadata is optional
    minimumSupport: 510000000, // This corresponds to 51% support
    requiredApproval: 510000000, // This corresponds to 51% approval
    feeAsset: FeeAsset.TNKR,
  })
  .signAndSend(selectedAccount.address, injector.signer);

console.log("Multisig created with ID:", multisig.id);
```

By following this guide, you should be able to successfully create a multisig and manage it using the `Saturn` class methods. Always remember to verify the creation of your multisig and monitor the transaction status to ensure successful operations.
