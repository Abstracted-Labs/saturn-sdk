import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import type { StorageKey } from "@polkadot/types/primitive";
import type { AnyTuple, Codec } from "@polkadot/types/types";
import BN from "bn.js";
import { FormEvent, useEffect, useState } from "react";
import { Multisig, MultisigTypes } from "../../src";

// const host = "wss://brainstorm.invarch.network";
const host = "ws://127.0.0.1:9944";

const App = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [multisig, setMultisig] = useState<Multisig>();
  const [details, setDetails] = useState<{
    supply: number;
    metadata: string;
    allowReplica: boolean;
    defaultPermission: boolean;
    executionThreshold: number;
    defaultAssetWeight: number;
  }>();
  const [openCalls, setOpenCalls] = useState<{}[]>();
  const [api, setApi] = useState<ApiPromise>();
  const [balance, setBalance] = useState<number>();
  const [power, setPower] = useState<number>();
  const [allBalances, setAllBalances] = useState<
    {
      address: string;
      balance: number;
    }[]
  >();
  const [ranking, setRanking] = useState<
    {
      address: string;
      amount: number;
      position: number;
    }[]
  >();

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

    const injector = await web3FromAddress(selectedAccount.address);

    const M = new Multisig({ api });

    if (M.isCreated()) {
      setMultisig(M);
    }

    const multisig = await M.create({
      address: selectedAccount.address,
      signer: injector.signer,
      executionThreshold: 51,
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

    setMultisig(multisig);
  };

  const handleGetTokenBalance = async () => {
    if (!multisig) return;

    if (!selectedAccount) return;

    const balance = await multisig.getBalance({
      address: selectedAccount.address,
    });

    setBalance(balance);
  };

  const handleGetPower = async () => {
    if (!multisig) return;

    if (!selectedAccount) return;

    const power = await multisig.getPower({
      address: selectedAccount.address,
    });

    setPower(power);
  };

  const handleGetOpenCalls = async () => {
    if (!multisig) return;

    const openCalls = await multisig.getOpenCalls();

    setOpenCalls(openCalls);
  };

  const handleNewMemberSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMember = e.currentTarget?.newMember.value;

    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!newMember) return;

    const UNIQUE_SUPPLY_AMOUNT = 1000000;

    const injector = await web3FromAddress(selectedAccount.address);

    multisig
      .addMember({
        address: newMember,
        amount: UNIQUE_SUPPLY_AMOUNT,
      })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleRemoveMemberSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const memberToRemove = e.currentTarget?.memberToRemove.value;

    if (!api) return;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!memberToRemove) return;

    const injector = await web3FromAddress(selectedAccount.address);

    const removeMemberCall = await multisig.removeMember({
      address: memberToRemove,
    });

    removeMemberCall.signAndSend(
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
      .vote({ callHash: votingCallHash })
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

  const handleComputeVotesSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const computeVotesCallHash = e.currentTarget?.computeVotesCallHash.value;

    if (!multisig) return;

    if (!selectedAccount) return;

    if (!computeVotesCallHash) return;

    const computedVotes = await multisig.computeVotes({
      callHash: computeVotesCallHash,
    });

    console.log(computedVotes);
  };

  const handleGetRanking = async () => {
    if (!multisig) return;

    if (!selectedAccount) return;

    const ranking = await multisig.createRanking();

    setRanking(ranking);
  };

  // const handleGetAllTokenBalances = async () => {
  //   if (!multisig) return;
  //   const allBalances = await multisig.getAllTokenBalances();
  //   const parsedBalances = allBalances.map(([storage, rawBalance]) => {
  //     const address = storage.args[1].toPrimitive() as string;
  //     const balance = rawBalance.toPrimitive() as number;
  //     return { address, balance };
  //   });
  //   setAllBalances(parsedBalances);
  // };
  // const handleCreateFakeCalls = async () => {
  //   if (!api) return;
  //   if (!multisig) return;
  //   if (!selectedAccount) return;
  //   if (!info) return;
  //   const calls = [
  //     info.allowReplica ? multisig.disallowReplica() : multisig.allowReplica(),
  //   ];
  //   const injector = await web3FromAddress(selectedAccount.address);
  //   multisig
  //     .createCall({
  //       calls,
  //       metadata: JSON.stringify({
  //         name: "test",
  //         description: "test",
  //         url: "test",
  //       }),
  //     })
  //     .signAndSend(
  //       selectedAccount.address,
  //       { signer: injector.signer },
  //       ({ events }) => {
  //         console.log(events.map((event) => event.toHuman()));
  //         const parsedEvents = events.map(
  //           (event) =>
  //             event.toPrimitive() as {
  //               method: string;
  //               data: { result: boolean };
  //             }
  //         );
  //         const success = parsedEvents.find(
  //           (event) => event.method === "MultisigExecuted"
  //         );
  //         if (!success) return;
  //         console.log("SUCCESS: ", success.data.result);
  //       }
  //     );
  // };

  // const handleTokensMintSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const amount = e.currentTarget?.mintTokens.value;
  //   if (!multisig) return;
  //   if (!selectedAccount) return;
  //   if (!amount) return;
  //   const injector = await web3FromAddress(selectedAccount.address);
  //   const calls = [
  //     multisig.mintToken({ amount, address: selectedAccount.address }),
  //   ];
  //   multisig
  //     .createCall({ calls })
  //     .signAndSend(
  //       selectedAccount.address,
  //       { signer: injector.signer },
  //       ({ events }) => {
  //         console.log(events.map((event) => event.toHuman()));
  //       }
  //     );
  // };
  // const handleTokensBurnSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const amount = e.currentTarget?.burnTokens.value;
  //   if (!multisig) return;
  //   if (!selectedAccount) return;
  //   if (!amount) return;
  //   const injector = await web3FromAddress(selectedAccount.address);
  //   const calls = [
  //     multisig.burnToken({ amount, address: selectedAccount.address }),
  //   ];
  //   multisig
  //     .createCall({ calls })
  //     .signAndSend(
  //       selectedAccount.address,
  //       { signer: injector.signer },
  //       ({ events }) => {
  //         console.log(events.map((event) => event.toHuman()));
  //       }
  //     );
  // };

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
            {power ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <span className="font-bold">User Power: </span>{" "}
                  <span>{power.toString()}</span>
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
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleRemoveMemberSubmit}
                  >
                    <div>
                      <label
                        htmlFor="memberToRemove"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Remove Member
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="memberToRemove"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Remove Member
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {ranking ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <pre className="overflow-auto">
                    {JSON.stringify(ranking, null, 2)}
                  </pre>
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
                  <form
                    className="flex w-full flex-col gap-4"
                    onSubmit={handleComputeVotesSubmit}
                  >
                    <div>
                      <label
                        htmlFor="computeVotesCallHash"
                        className="block text-sm font-medium text-neutral-700"
                      >
                        Compute Votes Call Hash
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="text"
                          id="computeVotesCallHash"
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                      Compute Votes
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
            {/* 
            {multisig ? (
              <div className="flex w-full gap-4 justify-center items-center p-4 border rounded-md">
                <form
                  className="flex w-full flex-col gap-4"
                  onSubmit={handleTokensMintSubmit}
                >
                  <div>
                    <label
                      htmlFor="mintTokens"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Quantity of Tokens to Mint
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="text"
                        id="mintTokens"
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                    Mint
                  </button>
                </form>
                <form
                  className="flex w-full flex-col gap-4"
                  onSubmit={handleTokensBurnSubmit}
                >
                  <div>
                    <label
                      htmlFor="burnTokens"
                      className="block text-sm font-medium text-neutral-700"
                    >
                      Quantity of Tokens to Burn
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="text"
                        id="burnTokens"
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                    Burn
                  </button>
                </form>
              </div>
            ) : null} */}
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
                    onClick={handleGetTokenBalance}
                  >
                    Get User Balance
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetPower}
                  >
                    Get User Power
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetOpenCalls}
                  >
                    Get Open Calls
                  </button>
                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetRanking}
                  >
                    Get Ranking
                  </button>

                  {/* <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleCreateFakeCalls}
                    disabled={!info}
                  >
                    Create Fake Call
                  </button>

                  <button
                    className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                    onClick={handleGetAllTokenBalances}
                  >
                    Get All Balances
                  </button> */}
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
