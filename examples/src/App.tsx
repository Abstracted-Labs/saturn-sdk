import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { FormEvent, useEffect, useState } from "react";
import { Multisig } from "../../src/multisig";

const host = "wss://brainstorm.invarch.network";

// const host = "ws://127.0.0.1:9944";

const App = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [multisig, setMultisig] = useState<Multisig>();
  const [api, setApi] = useState<ApiPromise>();
  const [info, setInfo] = useState<string>();

  const handleConnectAccounts = async () => {
    const extensions = await web3Enable("GitArch");

    if (extensions.length === 0) {
      return;
    }

    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      return;
    }

    if (accounts.length === 1) {
      const selectedAccount = accounts[0];

      setSelectedAccount(selectedAccount);
    }

    setAccounts(accounts);
  };

  const handleSelectAccount = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.currentTarget.account.value) return;

    const selectedAccount = accounts.find(
      (account) => account.address === e.currentTarget.account.value
    );

    if (!selectedAccount) return;

    setSelectedAccount(selectedAccount);
  };

  const setup = async () => {
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

    setApi(api);
  };

  const handleCreateMultisig = async () => {
    if (!api) return;

    if (!selectedAccount) return;

    const M = new Multisig({ api });

    const injector = await web3FromAddress(selectedAccount.address);

    const multisig = await M.create({
      address: selectedAccount.address,
      signer: injector.signer,
    });

    setMultisig(multisig);

    const info = (await multisig.info()).toPrimitive();

    setInfo(JSON.stringify(info, null, 2));
  };

  const handleGetMultisigSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!e.currentTarget.multisig.value) return;

    if (!api) return;

    const multisig = new Multisig({ api, id: e.currentTarget.multisig.value });

    setMultisig(multisig);

    const info = (await multisig.info()).toPrimitive();

    setInfo(JSON.stringify(info, null, 2));
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <>
      <>
        {accounts.length === 0 ? (
          <div className="flex p-8 justify-center items-center">
            <button
              className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
              onClick={handleConnectAccounts}
            >
              Connect
            </button>
          </div>
        ) : null}
      </>

      <>
        {accounts.length > 0 && !selectedAccount ? (
          <div className="flex p-8 justify-center items-center">
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSelectAccount}
            >
              <div>
                <label
                  htmlFor="account"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Accounts
                </label>
                <div className="mt-1">
                  <select
                    id="account"
                    className="block w-full max-w-lg rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:max-w-xs sm:text-sm"
                  >
                    {accounts.map((account) => (
                      <option key={account.address} value={account.address}>
                        {account.meta.name || account.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                Select
              </button>
            </form>
          </div>
        ) : null}
      </>

      <>
        {selectedAccount ? (
          <>
            <div className="flex p-8 justify-center items-center">
              <button
                className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                onClick={handleCreateMultisig}
              >
                Create Multisig
              </button>
            </div>

            <div className="flex p-8 justify-center items-center">
              <form
                className="flex flex-col gap-4"
                onSubmit={handleGetMultisigSubmit}
              >
                <div>
                  <label
                    htmlFor="multisig"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    Multisig ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="text"
                      id="multisig"
                      className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                    />
                  </div>
                </div>

                <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                  Get Multisig
                </button>
              </form>
            </div>

            {multisig && info ? (
              <div className="flex flex-col gap-4 justify-center items-center p-8">
                <div>
                  <span className="font-bold">Multisig ID: </span>{" "}
                  <span>{multisig.id}</span>
                </div>

                <div>
                  <pre>{info}</pre>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </>
    </>
  );
};

export default App;
