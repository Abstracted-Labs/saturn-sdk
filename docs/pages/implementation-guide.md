# Implementation Guide

This page goes over instructions and general recommendations on how to implement the Saturn SDK into wallets, dApps and hybrid wallet/dApps.

## 1. Initializing the Saturn class

The first thing to do in order to start using the SDK is to initialize a [`Saturn`](https://saturn-typedocs.invarch.network/classes/Saturn.html) class instance, you can do so with the following code:

```typescript
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Saturn } from "@invarch/saturn-sdk";

const wsProvider = new WsProvider(
  "wss://invarch-tinkernet.api.onfinality.io/public-ws"
);
const api = await ApiPromise.create({ provider: wsProvider });

const saturn = new Saturn({ api });
```

If you intend to use the SDK in a high traffic application it is recommended that you deploy and use your own node for Tinkernet (you can do so easily using [OnFInality](https://onfinality.io)), otherwise it's perfectly fine to use our public endpoint.

We also highly recommend that you keep the `Saturn` instance in a non-persistent store since it's designed to be reused during the whole lifecycle of a user session. You don't need to store the Tinkernet `ApiPromise` instance as it is kept within the `Saturn` instance.

## 2. General operation

In this guide we won't go over in detail about general management of multisigs and the convenient data query methods, for information about those check the previous pages of this documentation.

## 3. Building proposals

We want to highlight some decisions that have to be made depending on how you intend to use Saturn in your project, let's generalize the different scenarios as Wallets and dApps, hybrid wallet/dApps may use the information from both categories to build something more specific.

### dApps

If you are building a dApp and you wish to have Saturn multisigs managed through it you'll want to build calls in your own application and then feed those into Saturn, you can check how to do this in more detail in [Making Calls](./making-calls), but let's go over a code sample:

```typescript
// For Tinkernet calls, use .buildMultisigCall

const stakeCall = tinkernetApi.tx.ocifStaking.stake(0, "10000000000000");

saturn.buildMultisigCall({
  // The multisig id.
  id: 0,
  // The call to execute in Tinkernet
  call: stakeCall,
  // The asset to pay the transaction fee in Tinkernet.
  feeAsset: FeeAsset.TNKR,
  // Optional proposal metadata.
  proposalMetadata: "This is optional, but can be rather useful!"
});


// For other chains, use .sendXCMCall
// This is a wrapper that uses .buildMultisigCall internally.

const destination = "Basilisk";

const xcmFeeAsset = saturn.chains.find((c) => c.chain == "Basilisk").assets.find((asset) => asset.label == "BSX").registerType;

const swapCall = basiliskApi.tx.router.sell("KSM", "TNKR", "10000000000000", 0, [{ pool: "XYK", assetIn: "KSM", assetOut: "TNKR" }]);

const {weight, partialFee} = swapCall.paymentInfo("any address");

saturn.sendXCMCal({
    // The multisig id.
    id: number;
    // The destination chain.
    destination,
    // The actual call on the destination chain.
    callData: swapCall.toU8a(),
    // Optional proposal metadata.
    proposalMetadata: "This is optional, but can be rather useful!",
    // Weight for the call in the destination chain.
    weight: new BN(weight),
    // The fee for the XCM call and the transaction.
    // Multiplying by 2 is a conservative estimate.
    xcmFee: new BN(partialFee).mul("2"),
    // The asset to use when paying the fees in the destination chain.
    xcmFeeAsset,
})
```

As you can see, it's very simple to integrate Saturn in dApps, the only thing you need to worry about is selecting the chain you wish to execute calls in, and also consider that for Tinkernet itself you have to use a different method.


### Wallets

If you are building a pure wallet, you'll probably want to connect to dApps and then feed calls originating from them into Saturn.

You should keep some considerations in mind, as dApps don't understand the concept of multisigs and so you have to connect to them pretending to be a normal externally owned account, because of this we recommend receiving the call data, feeding it into Saturn to allow the user to propose a multisig operation, and then reply to the dApp with an error (which, if possible, shoudl specify something along the lines of `"Transaction sent to multisig."`).

Another one of those considerations to keep in mind is figuring out which chain to send the transaction to.
Upon receiving a request for signature from a dApp you should also be receiving indicators of the chain they're meant to be sent to, for example if you are using WalletConnect as the dApps connection method you'll receive a [CAIP-13](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-13.md) chain id, which you can then handle internally to match against one of th available Saturn chains.

```typescript
const destination = getChainNameFromChainId(chainId);

saturn.sendXCMCal({
    destination,
    ...
})
```

More information about building calls are available in [Making Calls](./making-calls).


