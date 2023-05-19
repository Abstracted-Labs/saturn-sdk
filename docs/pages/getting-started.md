# Setting up a `Saturn` Instance

Getting started with the Saturn Software Development Kit (SDK) is like unlocking a toolbox. Each tool within the toolbox corresponds to a different functionality you can leverage to manage multisigs. To begin, you first need to unlock this toolbox by instantiating a `Saturn` class object.

## 1. Importing Dependencies:

Your journey starts with gathering your tools. The required classes and functions from the SDK are your keys:

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Saturn } from "saturn-sdk";
```

Think of `ApiPromise` and `WsProvider` as your tool connectors, which are imported from the `@polkadot/api` package. Meanwhile, `Saturn` is your main toolbox from the `saturn-sdk` package.

## 2. Connecting to Tinkernet/InvArch:

Now it's time to connect your tools to the workbench, Tinkernet/InvArch, by establishing a connection using an instance of `ApiPromise`.

```typescript
const wsProvider = new WsProvider(
  "wss://invarch-tinkernet.api.onfinality.io/public-ws"
);
const api = await ApiPromise.create({ provider: wsProvider });
```

In this step, imagine constructing a communication bridge (WebSocket provider) with the address of your node and passing it to the `ApiPromise.create()` method to form a robust connection.

## 3. Instantiating the Saturn Class:

You're ready to unlock the toolbox! Create an instance of the `Saturn` class by using your connection (`api` object) as the key.

```typescript
const saturn = new Saturn({ api });
```

## 4. Ready to Roll:

Kudos! Your toolbox (Saturn instance) is now unlocked. You can utilize the SDK to create and manage multisigs. Picture each task you perform as using a different tool from this box.

Remember, ensuring your workbench (node URL) is set up correctly and your bridge (connection) is sturdy before you start using your tools is vital. Any missteps here could cause your tools (methods in the SDK) to malfunction.

Continuing this analogy, the following documentation sections will guide you on how to wield these tools effectively and get the job done.
