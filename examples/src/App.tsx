import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { FormEvent, useEffect, useState } from "react";
import { Multisig, MultisigTypes, MultisigRuntime, Xcm } from "../../src";

const host = "ws://127.0.0.1:9944";

const App = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [multisig, setMultisig] = useState<Multisig>();
  const [details, setDetails] = useState<{
    account: string;
    metadata: string;
    minimumSupport: number;
    requiredApproval: number;
    frozenTokens: boolean;
  }>();
  const [openCalls, setOpenCalls] = useState<{}[]>();
  const [api, setApi] = useState<ApiPromise>();
  const [balance, setBalance] = useState<number>();
  const [allBalances, setAllBalances] = useState<
    {
      address: string;
      balance: number;
    }[]
  >();
  const [chains, setChains] = useState<{ chain: string; assets: string[] }[]>([]);
    const [dest, setDest] = useState<{ chain: string; assets: string[] }>({chain: "", assets: []});
    const [asset, setAsset] = useState<string>("");

  const setup = async () => {
    const wsProvider = new WsProvider(host);

    const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        ...MultisigTypes,
      },
      runtime: {
        ...MultisigRuntime,
      },
    });

    const time = (await api.query.timestamp.now()).toPrimitive();

    console.log("CONNECTED TO", host, "AT", new Date(time));

    setApi(api);

    setChains(new Xcm({ api }).chains);
  };

  const handleConnectAccounts = async () => {
    const extensions = await web3Enable("DEMO");

    if (extensions.length === 0) {
      return;
    }

    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      return;
    }

    console.table(
      accounts.map((account) => ({
        address: account.address,
        name: account.meta.name || "",
      }))
    );

    if (accounts.length === 1) {
      const selectedAccount = accounts[0];
      setSelectedAccount(selectedAccount);
    }

    setAccounts(accounts);
  };

  const handleSelectAccount = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const address = e.currentTarget?.address.value;

    if (!address) return;

    const selectedAccount = accounts.find(
      (account) => account.address === address
    );

    if (!selectedAccount) return;

    setSelectedAccount(selectedAccount);

      const multisig = new Multisig({ api, id: "0" });

      // multisig
      //     .transferExternalAssetCall({
      //         asset: { "Basilisk": "KSM" },
      //         amount: 1000000000000,
      //         to: "5H3L3sTEjFuC9pQEHefkRoffpQdppgWzSPvdHL1Xf3PuZiRX",
      //         feeAsset: { "Basilisk": "KSM" },
      //         fee: 1000000000000,
      //     })
      //     .signAndSend(
      //         selectedAccount.address,
      //         { signer: injector.signer },
      //         ({ events }) => {
      //             console.log(events.map((event) => event.toHuman()));
      //         }
      //     );
  };

  const handleCreateMultisig = async () => {
    if (!api) return;

    if (!selectedAccount) return;

    const injector = await web3FromAddress(selectedAccount.address);

    const M = new Multisig({ api });

    if (M.isCreated()) {
      setMultisig(M);
    }

    const multisig = await M.create({
      address: selectedAccount.address,
      signer: injector.signer,
      minimumSupport: 51,
      requiredApproval: 51,
    });

    setMultisig(multisig);
  };

  const handleGetMultisigDetails = async () => {
    if (!multisig) return;
    const details = await multisig.getDetails();

    setDetails(details);
  };

  const handleGetMultisigSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id = e.currentTarget?.multisig.value;

    if (!id) return;

    if (!api) return;

    const multisig = new Multisig({ api, id });

    const assets = await multisig.getExternalAssets();

    const parachains = await multisig.getParachains();

    console.log({ assets, parachains });

    setMultisig(multisig);
  };

  const handleGetOpenCalls = async () => {
    if (!multisig) return;

    const openCalls = await multisig.getOpenCalls();

    setOpenCalls(openCalls);
  };

  const handleSendExternalCallSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const externalDestination = e.currentTarget?.externalDestination.value;

    const externalWeight = e.currentTarget?.externalWeight.value;

    const externalCallData = e.currentTarget?.externalCallData.value;

    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .sendExternalCall({
        destination: externalDestination,
        weight: externalWeight,
        callData: externalCallData,
      })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleTransferExternalAssetCallSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

      console.log(`{"${dest.chain}": "${asset}"}`)
      const externalAsset = JSON.parse(`{"${dest.chain}": "${asset}"}`);

    const externalAmount = e.currentTarget?.externalAmount.value;

    const externalTo = e.currentTarget?.externalTo.value;

    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .transferExternalAssetCall({
        asset: externalAsset,
        amount: externalAmount,
        to: externalTo,
        feeAsset: externalAsset,
        fee: 1000000000000
      })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleVoteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const votingCallHash = e.currentTarget?.votingCallHash.value;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!votingCallHash) return;

    if (!openCalls) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .vote({ callHash: votingCallHash, aye: true })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleWithdrawVoteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const withdrawVoteCallHash = e.currentTarget?.withdrawVotingCallHash.value;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!withdrawVoteCallHash) return;

    if (!openCalls) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .withdrawVote({ callHash: withdrawVoteCallHash })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleGetPendingCallSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pendingCallHash = e.currentTarget?.pendingCallHash.value;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!pendingCallHash) return;

    const pendingCall = await multisig.getPendingCall({
      callHash: pendingCallHash,
    });

    console.log(pendingCall);
  };

  const handleGetTNKRBalance = async () => {
    if (!selectedAccount) return;

    if (!api) return;

    const balance = await api.query.system.account(selectedAccount.address);

    console.log("BALANCE", balance.data.toPrimitive());
  };

  useEffect(() => {
    if (!api) {
      setup();
    }
  }, [api]);

  useEffect(() => {
    handleGetTNKRBalance();
  }, [selectedAccount, api]);

  return (
    <div className="flex flex-col gap-4 p-8 max-w-2xl items-center justify-center mx-auto">
      <>
        {accounts.length === 0 ? (
          <div className="w-full flex justify-center items-center">
            <button
              className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
              onClick={handleConnectAccounts}
            >
              Connect
            </button>
          </div>
        ) : null}

        {accounts.length > 0 && !selectedAccount ? (
          <div className="w-full flex justify-center items-center">
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSelectAccount}
            >
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Accounts
                </label>
                <div className="mt-1">
                  <select
                    id="address"
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

        {selectedAccount ? (
          <>
            {!multisig ? (
              <>
                <div className="w-full flex justify-center items-center">
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleCreateMultisig}
                  >
                    Create Multisig
                  </button>
                </div>
                <div className="flex justify-center items-center">
                  <span>or</span>
                </div>
                <div className="flex justify-center items-center">
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
              </>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <span className="font-bold">Multisig ID: </span>{" "}
                  <span>{multisig.id}</span>
                </div>
              </div>
            ) : null}

            {details ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}

            {balance ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <span className="font-bold">User Balance: </span>{" "}
                  <span>{balance.toString()}</span>
                </div>
              </div>
            ) : null}

            {allBalances ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(allBalances, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full flex gap-4">
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleSendExternalCallSubmit}
                  >
                    <div>
                      <label
                        htmlFor="externalDestination"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Destination
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="externalDestination"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="externalWeight"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Weight
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="externalWeight"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="externalCallData"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Call Data
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="externalCallData"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Send External Call
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full flex gap-4">
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleTransferExternalAssetCallSubmit}
                  >
                    <div>
                      <label
                        htmlFor="externalDestination"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Destination
                      </label>
                      <div className="mt-1">
                    <select value={dest.chain} onChange={e => {
                        const c = chains.find(i => i.chain == e.target.value);
                        setDest(c);
                        setAsset(c.assets[0])

                    }}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                    >
                    {chains.map(c => <option value={c.chain}>{c.chain}</option>)}
                     </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="externalAsset"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Asset
                      </label>
                      <div className="mt-1">
                    <select value={asset} onChange={e => setAsset(e.target.value)}
                className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                    >
                    {dest.assets.map(a => (<option value={a}>{a}</option>))}
                </select>
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="externalAmount"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Amount
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="externalAmount"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="externalTo"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        To
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="externalTo"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Transfer External Asset
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {openCalls ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(openCalls, null, 2)}
                  </pre>
                </div>
                <div className="flex w-full gap-4 justify-center items-center p-4 border rounded-md flex-wrap">
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleVoteSubmit}
                  >
                    <div>
                      <label
                        htmlFor="votingCallHash"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Voting Call Hash
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="votingCallHash"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Vote
                    </button>
                  </form>
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleWithdrawVoteSubmit}
                  >
                    <div>
                      <label
                        htmlFor="withdrawVotingCallHash"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Withdraw Voting Call Hash
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="withdrawVotingCallHash"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Withdraw Vote
                    </button>
                  </form>
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleGetPendingCallSubmit}
                  >
                    <div>
                      <label
                        htmlFor="pendingCallHash"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Pending Call Hash
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="pendingCallHash"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Get Pending Call
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full flex gap-4 flex-wrap">
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetMultisigDetails}
                  >
                    Get Details
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetOpenCalls}
                  >
                    Get Open Calls
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </>
    </div>
  );
};

export default App;
