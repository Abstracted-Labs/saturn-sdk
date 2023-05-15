# Setting up a `Saturn` Instance

To start interacting with the Software Development Kit (SDK), you first need to instantiate a `Saturn` class object. This object will provide you with access to the necessary methods for creating and managing multisigs.

## 1. Importing Dependencies:

Start by importing the required classes and functions from the SDK:

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Saturn } from "saturn-sdk";
```

Here, `ApiPromise` and `WsProvider` are imported from the `@polkadot/api` package, while `Saturn` is imported from the `saturn-sdk` package.

## 2. Connecting to Tinkernet/InvArch:

Next, establish a connection to a Tinkernet/InvArch node by creating an instance of `ApiPromise`.

```typescript
const wsProvider = new WsProvider(
  "wss://invarch-tinkernet.api.onfinality.io/public-ws"
);
const api = await ApiPromise.create({ provider: wsProvider });
```

In this step, we're creating a WebSocket provider with our node's URL and passing it to `ApiPromise.create()` method to establish the connection.

## 3. Instantiating the Saturn Class:

Create an instance of the `Saturn` class by passing the `api` object (created in step 2) to the constructor. This will give you a `saturn` object that you can use to interact with the SDK.

```typescript
const saturn = new Saturn({ api });
```

## 4. Ready to Roll:

Congratulations! You've successfully set up your `Saturn` instance. You can now start using the SDK to create and manage multisigs. Continue reading this documentation for examples on how to perform common operations with your `Saturn` instance.

Remember to always ensure your node URL is correct and your connection to it is successful before attempting to interact with the SDK. An incorrect URL or a failed connection could lead to errors in the following steps.
