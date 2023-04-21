# Usage

### Create a multisig

```ts
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

### Get Multisig members

```ts
const members = await saturn.getMultisigMembers(multisig.id);
```

### Propose new member

```ts
const UNIQUE_SUPPLY_AMOUNT = new BN("1000000");

const address = selectedAccount.address;
const signer = (await web3FromAddress(address)).signer;

saturn
  .proposeNewMember({
    id,
    address: newMember,
    amount: UNIQUE_SUPPLY_AMOUNT,
  })
  .signAndSend(address, signer);
```

### Propose member removal

```ts
const address = selectedAccount.address;
const signer = (await web3FromAddress(address)).signer;

const amount = await saturn.getMultisigMemberBalance({
  id,
  address: memberToRemove,
});

saturn
  .proposeMemberRemoval({
    amount,
    id,
    address: memberToRemove,
  })
  .signAndSend(address, signer);
```
