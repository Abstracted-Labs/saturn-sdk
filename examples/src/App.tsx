import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { StorageKey } from "@polkadot/types/primitive";
import { AnyJson, AnyTuple, Codec } from "@polkadot/types/types";
import { FormEvent, useEffect, useState } from "react";
import { Multisig, MultisigTypes } from "../../src";

// const host = "wss://brainstorm.invarch.network";
const host = "ws://127.0.0.1:9944";

const App = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [multisig, setMultisig] = useState<Multisig>();
  const [info, setInfo] = useState<AnyJson>();
  const [pendingCalls, setPendingCalls] =
    useState<[StorageKey<AnyTuple>, Codec][]>();
  const [api, setApi] = useState<ApiPromise>();

  const setup = async () => {
    const wsProvider = new WsProvider(host);

    const api = await ApiPromise.create({
      provider: wsProvider,
      types: {
        ...MultisigTypes,
      },
    });

    const time = (await api.query.timestamp.now()).toPrimitive();

    console.log(time);

    setApi(api);
  };

  const handleConnectAccounts = async () => {
    const extensions = await web3Enable("GitArch");

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
  };

  const handleCreateMultisig = async () => {
    if (!api) return;

    if (!selectedAccount) return;

    const M = new Multisig({ api });

    const injector = await web3FromAddress(selectedAccount.address);

    if (M.isCreated()) {
      setMultisig(M);
    }

    const multisig = await M.create({
      address: selectedAccount.address,
      signer: injector.signer,
      // to show the pending calls on the demo
      executionThreshold: 51,
    });

    setMultisig(multisig);
  };

  const handleGetMultisigInfo = async () => {
    if (!multisig) return;

    const info = (await multisig.info()).toPrimitive();

    setInfo(info);
  };

  const handleGetMultisigSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const id = e.currentTarget?.multisig.value;

    if (!id) return;

    if (!api) return;

    const multisig = new Multisig({ api, id });

    setMultisig(multisig);
  };

  const handleGetPendingCalls = async () => {
    if (!multisig) return;

    const pendingCalls = await multisig.getPendingCalls();

    // @ts-ignore
    setPendingCalls(pendingCalls);
  };

  const handleCreateFakeCalls = async () => {
    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    const calls = [api.tx.inv4.allowReplica(multisig.id)];

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .createCall({
        calls,
        metadata: JSON.stringify({
          name: "test",
          description: "test",
          url: "test",
        }),
      })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));

          const parsedEvents = events.map(
            (event) =>
              event.toPrimitive() as {
                method: string;
                data: { result: boolean };
              }
          );

          const success = parsedEvents.find(
            (event) => event.method === "MultisigExecuted"
          );

          if (!success) return;

          console.log("SUCCESS: ", success.data.result);
        }
      );
  };

  const handleNewMemberSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMember = e.currentTarget?.newMember.value;

    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!newMember) return;

    const UNIQUE_SUPPLY_AMOUNT = "1000000";

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .addNewMember({
        address: newMember,
        amount: UNIQUE_SUPPLY_AMOUNT,
      })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));

          const parsedEvents = events.map(
            (event) =>
              event.toPrimitive() as {
                method: string;
                data: { result: boolean };
              }
          );

          const success = parsedEvents.find(
            (event) => event.method === "MultisigExecuted"
          );

          if (!success) return;

          console.log("SUCCESS: ", success.data.result);
        }
      );
  };

  const handleVoteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const votingCallHash = e.currentTarget?.votingCallHash.value;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!votingCallHash) return;

    if (!pendingCalls) return;

    const votingCall = pendingCalls.find(
      ([key]) => key.toPrimitive() === votingCallHash
    );

    if (!votingCall) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .vote({ callHash: votingCall[0].args[1].toHex() })
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

    if (!pendingCalls) return;

    const withdrawVoteCall = pendingCalls.find(
      ([key]) => key.toPrimitive() === withdrawVoteCallHash
    );

    if (!withdrawVoteCall) return;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .withdrawVote({ callHash: withdrawVoteCall[0].args[1].toHex() })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  useEffect(() => {
    setup();
  }, []);

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
      </>

      <>
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
      </>

      <>
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

            {info ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(info, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}

            {pendingCalls ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(pendingCalls, null, 2)}
                  </pre>
                </div>

                <div className="flex w-full gap-4 justify-center items-center p-4 border rounded-md">
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
                </div>
              </div>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full flex gap-4">
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleNewMemberSubmit}
                  >
                    <div>
                      <label
                        htmlFor="newMember"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        New Member
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="newMember"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Add New Member
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {multisig ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full flex gap-4">
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetMultisigInfo}
                  >
                    Get Information
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleCreateFakeCalls}
                  >
                    Create Fake Calls
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetPendingCalls}
                  >
                    Get Pending Calls
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
