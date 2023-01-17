import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { useState } from "react";
import { Multisig } from "../../src/multisig";

const host = "wss://brainstorm.invarch.network";

// const host = "ws://127.0.0.1:9944";

const App = () => {
  const [multisig, setMultisig] = useState<Multisig>();

  const handleCreateMultisig = async () => {
    const extensions = await web3Enable("GitArch");

    if (extensions.length === 0) {
      return;
    }

    const accounts = await web3Accounts();

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

    const M = new Multisig({ api });

    const injector = await web3FromAddress(selectedAccount.address);

    const multisig = await M.create({
      address: selectedAccount.address,
      signer: injector.signer,
    });

    setMultisig(multisig);
  };

  return (
    <>
      <div className="flex p-8 justify-center items-center">
        <button
          className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
          onClick={handleCreateMultisig}
        >
          Create Multisig
        </button>
      </div>

      {multisig ? (
        <div className="flex flex-col gap-4 justify-center items-center">
          <span className="block">
            <span className="font-bold">Multisig ID: </span>{" "}
            <span>{multisig.id}</span>
          </span>
        </div>
      ) : null}
    </>
  );
};

export default App;
