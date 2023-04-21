# Creating a multisig

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
```
