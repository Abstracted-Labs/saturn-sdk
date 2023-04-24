# Creating a multisig

To create a multisig using the SDK, you will first need to instantiate a Saturn class object, which provides access to the necessary methods for creating and managing multisigs. Here's a step-by-step guide on how to create a multisig:

1. **Import necessary dependencies:**
   Import the required classes and functions from the SDK. For example:

   ```typescript
   import { ApiPromise, WsProvider } from "@polkadot/api";
   import { Saturn } from "saturn-sdk";
   ```

2. **Connect to the blockchain:**
   Create an instance of `ApiPromise` to connect to a blockchain node. You can replace the WebSocket provider URL with the address of your node.

   ```typescript
   const wsProvider = new WsProvider("wss://your-node-url");
   const api = await ApiPromise.create({ provider: wsProvider });
   ```

3. **Instantiate the Saturn class:**
   Create an instance of the `Saturn` class by passing the `api` object to the constructor.

   ```typescript
   const saturn = new Saturn({ api });
   ```

4. **Create a new multisig:**
   To create a new multisig, you need to call the `createMultisig` method on the `saturn` object. This method requires the following parameters:

   - `minimumSupport`: The minimum support required for approval (a `Perbill`, `BN`, or a number)
   - `requiredApproval`: The required approval percentage (a `Perbill`, `BN`, or a number)

   Example:

   ```typescript
   const minimumSupport = 500000000; // 50% support;
   const requiredApproval = 600000000; // 60% approval;

   const injector = await web3FromAddress(selectedAccount.address);

   const multisig = await saturn
     .createMultisig({
       minimumSupport,
       requiredApproval,
     })
     .signAndSend(selectedAccount.address, injector.signer);
   ```

5. **Check the result:**
   The `createMultisig` method will return a Promise that resolves to the multisig ID once it is created. You can print the multisig ID to the console to verify the creation.

   ```typescript
   console.log("Multisig created with ID:", multisig.id);
   ```

Once the multisig is created, you can use the other methods provided by the `Saturn` class to manage and interact with the multisig, such as proposing new members, removing members, and voting on proposals.

Here is the full example

```typescript
const wsProvider = new WsProvider(host);

const accounts = await web3Accounts();

const api = await ApiPromise.create({ provider: wsProvider });

const selectedAccount = accounts[0];

const saturn = new Saturn({ api });

const injector = await web3FromAddress(selectedAccount.address);

const multisig = await saturn
  .createMultisig({
    minimumSupport: 510000000,
    requiredApproval: 510000000,
  })
  .signAndSend(selectedAccount.address, injector.signer);

console.log("Multisig created with ID:", multisig.id);
```
