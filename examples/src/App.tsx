import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { GenericCall, GenericExtrinsic } from "@polkadot/types";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { FormEvent, useEffect, useState } from "react";
import {
  Saturn,
  MultisigCallResult,
  MultisigCallExecuted,
  MultisigCallVoteStarted,
} from "../../src";
import { BN } from "@polkadot/util";

const host = "ws://127.0.0.1:9944";

const endpoints = {
  KUSAMA: "ws://127.0.0.1:9955",
};

const App = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [saturn, setSaturn] = useState<Saturn>();
  const [details, setDetails] = useState<{
    account: string;
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
  const [destTransfer, setDestTransfer] = useState<{
    chain: string;
    assets: { label: string; registerType: Object }[];
  }>({ chain: "", assets: [] });
  const [assetTransfer, setAssetTransfer] = useState<{
    label: string;
    registerType: Object;
  }>({ label: "", registerType: {} });
  const [destCall, setDestCall] = useState<{
    chain: string;
    assets: { label: string; registerType: Object }[];
  }>({ chain: "", assets: [] });
  const [id, setId] = useState<string>("");
  const [lastCallResult, setLastCallResult] = useState<MultisigCallResult>();
  const [userMultisigs, setUserMultisigs] = useState<string[]>([]);
  const [selectedMultisig, setSelectedMultisig] = useState<string>();
  const [multisigMembers, setMultisigMembers] = useState<string[]>();

  const setup = async () => {
    const wsProvider = new WsProvider(host);

    const api = await ApiPromise.create({ provider: wsProvider });

    const time = (await api.query.timestamp.now()).toPrimitive();

    console.log("CONNECTED TO", host, "AT", new Date(time));

    setApi(api);
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
      const address = selectedAccount.address;
      const signer = (await web3FromAddress(address)).signer;

      if (!api) return;

      const sat = new Saturn({ api, address, signer });

      setSaturn(sat);

      const ids = (await sat.getMultisigsForAccount(address)).map(
        ({ multisigId, tokens }) => multisigId
      );

      setUserMultisigs(ids);
      setSelectedMultisig(ids[0].toString());
    }

    setAccounts(accounts);
  };

  const handleSelectAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const a = e.currentTarget?.address.value;

    if (!a) return;

    const selectedAccount = accounts.find((account) => account.address === a);

    if (!selectedAccount) return;

    setSelectedAccount(selectedAccount);

    const address = selectedAccount.address;
    const signer = (await web3FromAddress(address)).signer;

    if (!api) return;

    const sat = new Saturn({ api, address, signer });

    setSaturn(sat);

    const ids = (await sat.getMultisigsForAccount(address)).map(
      ({ multisigId, tokens }) => multisigId
    );

    setUserMultisigs(ids);
    setSelectedMultisig(ids[0].toString());
  };

  const handleCreateMultisig = async () => {
    if (!api) return;
    if (!selectedAccount) return;
    if (!saturn) return;

    const injector = await web3FromAddress(selectedAccount.address);

    const multisig = await saturn.create({
      address: selectedAccount.address,
      signer: injector.signer,
      minimumSupport: 510000000,
      requiredApproval: 510000000,
    });

    console.log("created multisig: ", multisig);

    setId(multisig.id.toString());
  };

  const handleGetMultisigDetails = async () => {
    if (!saturn) return;
    const details = await saturn.getDetails(id);

    setDetails(details);
  };

  const handleGetMultisigSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!saturn) return;
    e.preventDefault();

    const id = e.currentTarget?.multisig.value;

    if (!id) return;

    setId(id);

    const details = await saturn.getDetails(id);

    setDetails(details);

    const members = await saturn.getMultisigMembers(id);

    setMultisigMembers(members.map((acc) => acc.toString()));
  };

  const handleGoMultisig = async () => {
    if (!saturn) return;

    const id = selectedMultisig;

    if (!id) return;

    setId(id);

    const details = await saturn.getDetails(id);

    setDetails(details);

    const members = await saturn.getMultisigMembers(id);

    setMultisigMembers(members.map((acc) => acc.toString()));
  };

  const handleGetOpenCalls = async () => {
    if (!saturn) return;

    const openCalls = await saturn.getOpenCalls(id);

    setOpenCalls(openCalls);
  };

  const handleSendExternalCallSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const externalDestination = destCall.chain;

    const externalWeight = e.currentTarget?.externalWeight.value;

    const externalCallData = e.currentTarget?.externalCallData.value;

    if (!api) return;

    if (!saturn) return;

    if (!selectedAccount) return;

    const destProvider = new WsProvider(endpoints.KUSAMA);

    const destApi = await ApiPromise.create({ provider: destProvider });

    const call = new GenericCall(api.registry, externalCallData);

    const ext = new GenericExtrinsic(
      api.registry,
      new GenericCall(api.registry, externalCallData)
    );

    const fee = await destApi.tx.system
      .remarkWithEvent("test")
      .paymentInfo(selectedAccount.address);

    console.log("fee: ", fee);

    const injector = await web3FromAddress(selectedAccount.address);

    await saturn.sendXcmCall({
      id,
      destination: externalDestination,
      weight: externalWeight,
      callData: externalCallData,
      feeAsset: destCall.assets[0].registerType.toString(),
      fee: fee.partialFee,
    });
  };

  const handleTransferExternalAssetCallSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const externalAsset = assetTransfer.registerType;

    const externalAmount = e.currentTarget?.externalAmount.value;

    const externalTo = e.currentTarget?.externalTo.value;

    if (!api) return;

    if (!saturn) return;

    const result: MultisigCallResult = await saturn.transferXcmAsset({
      id,
      asset: externalAsset.toString(),
      amount: externalAmount,
      to: externalTo,
      feeAsset: externalAsset.toString(),
      fee: new BN("1000000000000"),
    });

    setLastCallResult(result);
  };

  const handleVoteSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const votingCallHash = e.currentTarget?.votingCallHash.value;

    if (!saturn) return;

    if (!selectedAccount) return;

    if (!votingCallHash) return;

    if (!openCalls) return;

    const injector = await web3FromAddress(selectedAccount.address);

    saturn
      .vote({ id, callHash: votingCallHash, aye: true })
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

    if (!saturn) return;

    if (!selectedAccount) return;

    if (!withdrawVoteCallHash) return;

    if (!openCalls) return;

    const injector = await web3FromAddress(selectedAccount.address);

    saturn
      .withdrawVote({ id, callHash: withdrawVoteCallHash })
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

    if (!saturn) return;

    if (!selectedAccount) return;

    if (!pendingCallHash) return;

    const pendingCall = await saturn.getPendingCall({
      id,
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
            {!id ? (
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
                <div className="flex justify-center items-center">
                  <span>or</span>
                </div>

                <div className="flex justify-center items-center">
                  <div className="flex flex-col gap-4">
                    <label className="block text-sm font-medium text-neutral-700">
                      Your Multisigs
                    </label>
                    <div className="mt-1">
                      <select
                        value={selectedMultisig}
                        onChange={(e) => {
                          setSelectedMultisig(e.target.value);
                        }}
                        className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                      >
                        {userMultisigs.map((m) => (
                          <option value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                      onClick={handleGoMultisig}
                    >
                      Go
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {id ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <span className="font-bold">Multisig ID: </span>{" "}
                  <span>{id}</span>
                </div>
              </div>
            ) : null}

            {details && api ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <p>
                    <b>Account:</b> {details.account}
                  </p>
                  <p>
                    <b>Minimum support:</b>{" "}
                    {api.registry
                      .createType("Perbill", details.minimumSupport * 100)
                      .toHuman()}
                  </p>
                  <p>
                    <b>Required approval:</b>{" "}
                    {api.registry
                      .createType("Perbill", details.requiredApproval * 100)
                      .toHuman()}
                  </p>
                </div>
              </div>
            ) : null}

            {multisigMembers ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="flex justify-center items-center">
                  <span>Members</span>
                </div>
                <div className="border rounded-md p-4 w-full">
                  {multisigMembers.map((m) => (
                    <p>{m}</p>
                  ))}
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

            {id && saturn ? (
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
                        <select
                          value={destCall.chain}
                          onChange={(e) => {
                            const c = saturn.chains.find(
                              (i) => i.chain == e.target.value
                            );
                            if (c) setDestCall(c);
                          }}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        >
                          {saturn.chains.map((c) => (
                            <option value={c.chain}>{c.chain}</option>
                          ))}
                        </select>
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

            {id && saturn ? (
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
                        <select
                          value={destTransfer.chain}
                          onChange={(e) => {
                            const c = saturn.chains.find(
                              (i) => i.chain == e.target.value
                            );
                            if (c) {
                              setDestTransfer(c);
                              setAssetTransfer(c.assets[0]);
                            }
                          }}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        >
                          {saturn.chains.map((c) => (
                            <option value={c.chain}>{c.chain}</option>
                          ))}
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
                        <select
                          value={assetTransfer.label}
                          onChange={(e) => {
                            const a = destTransfer.assets.find(
                              (i) => i.label == e.target.value
                            );
                            if (a) setAssetTransfer(a);
                          }}
                          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                        >
                          {destTransfer.assets.map((a) => (
                            <option value={a.label}>{a.label}</option>
                          ))}
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

            {lastCallResult ? (
              <div className="w-full flex flex-col gap-4 justify-center items-center">
                <div className="border rounded-md p-4 w-full">
                  <p>
                    <b>Executed:</b> {lastCallResult.executed}
                  </p>
                  <p>
                    <b>Account:</b> {lastCallResult.result.account}
                  </p>
                  <p>
                    <b>Call Hash:</b> {lastCallResult.result.callHash}
                  </p>
                  <p>
                    <b>Call:</b> {JSON.stringify(lastCallResult.result.call)}
                  </p>
                  <p>
                    <b>Voter:</b> {lastCallResult.result.voter}
                  </p>
                  {lastCallResult.executed ? (
                    <p>
                      <b>Execution Result:</b>{" "}
                      {JSON.stringify(
                        (lastCallResult.result as MultisigCallExecuted)
                          .executionResult
                      )}
                    </p>
                  ) : (
                    <p>
                      <b>Votes Added:</b>{" "}
                      {(
                        (lastCallResult.result as MultisigCallVoteStarted)
                          .votesAdded as { aye: BN }
                      ).aye
                        ? `Aye: ${
                            (
                              (lastCallResult.result as MultisigCallVoteStarted)
                                .votesAdded as { aye: BN }
                            ).aye
                          }`
                        : `Nay: ${
                            (
                              (lastCallResult.result as MultisigCallVoteStarted)
                                .votesAdded as { nay: BN }
                            ).nay
                          }`}
                    </p>
                  )}
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

            {id ? (
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
