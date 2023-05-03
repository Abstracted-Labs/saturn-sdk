# Setting up a `Saturn` instance

To start using the SDK, you will first need to instantiate a Saturn class object, which provides access to the necessary methods for creating and managing multisigs.

1. **Import necessary dependencies:**
   Import the required classes and functions from the SDK. For example:

   ```typescript
   import { ApiPromise, WsProvider } from "@polkadot/api";
   import { Saturn } from "saturn-sdk";
   ```

2. **Connect to Tinkernet/InvArch:**
   Create an instance of `ApiPromise` to connect to a Tinkernet/InvArch node. You can replace the WebSocket provider URL with the address of your node.

   ```typescript
   const wsProvider = new WsProvider("wss://your-node-url");
   const api = await ApiPromise.create({ provider: wsProvider });
   ```

3. **Instantiate the Saturn class:**
   Create an instance of the `Saturn` class by passing the `api` object to the constructor.

   ```typescript
   const saturn = new Saturn({ api });
   ```
   
   4. **That's it, you're all set!**
      You can now start using the SDK, continue reading this documentation for examples on how to do common operations with your `Saturn` instance!
