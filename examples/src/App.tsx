import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { useState } from "react";
import { Multisig } from "../../src/multisig";

const host = "wss://brainstorm.invarch.network";

const App = () => {
  const [accounts, setAccounts] = useState<any[]>([]);

  const handleCreateMultisig = async () => {
    const extensions = await web3Enable("GitArch");

    if (extensions.length === 0) {
      return;
    }

    const accounts = await web3Accounts();

    setAccounts(accounts);

    if (accounts.length === 0) {
      return;
    }

    const selectedAccount = accounts[0];

    const wsProvider = new WsProvider(host);

    const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        OneOrPercent: {
          _enum: {
            One: null,
            Percent: "Percent",
          },
        },
      },
    });

    console.log(selectedAccount.address);

    const injector = await web3FromAddress(selectedAccount.address);

    const multisig = await new Multisig({ api }).create({
      address: selectedAccount.address,
      signer: injector.signer,

      onDropped: (status) => {
        console.log("dropped", status);
      },
      onError: (status) => {
        console.log("error", status);
      },
      onExecuted: (status) => {
        console.log("executed", status.events.at(-1)?.toHuman());
      },
      onInvalid: (status) => {
        console.log("invalid", status);
      },
      onLoading: (status) => {
        console.log("loading", status);
      },
      onSuccess: (status) => {
        console.log("success", status);
      },
      onUnknown: (status) => {
        console.log("unknown", status);
      },
    });

    const id = await multisig.id;

    console.log(id);
  };

  return (
    <>
      <button onClick={handleCreateMultisig}>Create Multisig</button>
    </>
  );
};

export default App;
