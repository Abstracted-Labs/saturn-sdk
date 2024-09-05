import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { FormEvent, useEffect, useState } from "react";
import { Saturn, MultisigCallResult, MultisigDetails, CallDetailsWithHash, CallDetails } from "../../src";
import { BN } from "@polkadot/util";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import YAML from "yaml";
import { SubmittableExtrinsic, ApiTypes } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { PalletDaoManagerMultisigMultisigOperation } from "@polkadot/types/lookup";
import { u8aToHex } from "@polkadot/util";
import { Call } from "@polkadot/types/interfaces";
import { Bytes } from "@polkadot/types-codec";
import { ChakraProvider, Grid, GridItem, NumberInput, NumberInputField, FormControl, FormLabel, Button } from '@chakra-ui/react';

const host = "wss://brainstorm.invarch.network/rococo";

const bsxHost = "wss://basilisk-rococo-rpc.play.hydration.cloud";

const Demo = () => {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();
  const [saturn, setSaturn] = useState<Saturn>();
  const [details, setDetails] = useState<MultisigDetails>();
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
  const [id, setId] = useState<number>();
  const [lastCallResult, setLastCallResult] = useState<MultisigCallResult>();
  const [userMultisigs, setUserMultisigs] = useState<number[]>([]);
  const [selectedMultisig, setSelectedMultisig] = useState<number>();
  const [multisigMembers, setMultisigMembers] = useState<string[]>();

  const [latestCall, setLatestCall] = useState<CallDetailsWithHash | null>();
  const [subsSetUp, setSubsSetUp] = useState<boolean>(false);
  const [bsxApi, setBsxApi] = useState<ApiPromise>();

  const setup = async () => {
    const wsProvider = new WsProvider(host);

    const api = await ApiPromise.create({ provider: wsProvider });

    const time = (await api.query.timestamp.now()).toPrimitive();

    console.log("CONNECTED TO", host, "AT", new Date(time));

    setApi(api);

    const bsxApi = await ApiPromise.create({ provider: new WsProvider(bsxHost) });

    setBsxApi(bsxApi);
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

      if (!api) return;

      const sat = new Saturn({ api });

      setSaturn(sat);

      const ids = (
        await sat.getMultisigsForAccount(selectedAccount.address)
      ).map(({ multisigId, tokens }) => multisigId);

      setUserMultisigs(ids);
      setSelectedMultisig(ids[0]);
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

    if (!api) return;

    const sat = new Saturn({ api });

    setSaturn(sat);

    const ids = (await sat.getMultisigsForAccount(selectedAccount.address)).map(
      ({ multisigId, tokens }) => multisigId
    );

    setUserMultisigs(ids);
    setSelectedMultisig(ids[0]);
  };

  const handleGetMultisigDetails = async () => {
    if (!saturn) return;
    if (!id) return;

    const details = await saturn.getDetails(id);

    if (!details) return;

    setDetails(details);
  };

  const handleGetMultisigSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!saturn) return;
    e.preventDefault();

    const id = parseInt(e.currentTarget?.multisig.value);

    console.log(id)

    if (!id.toString()) return;

    setId(id);

    const details = await saturn.getDetails(id);

    console.log(details)

    if (!details) return;

    setDetails(details);

    const members = await saturn.getMultisigMembers(id);

    setMultisigMembers(members.map((acc) => acc.toString()));
  };

  const handleGoMultisig = async () => {
    if (!saturn) return;

    const id = selectedMultisig;

    if (!id?.toString()) return;

    setId(id);

    const details = await saturn.getDetails(id);

    console.log(details)

    if (!details) return;

    setDetails(details);

    const members = await saturn.getMultisigMembers(id);

    setMultisigMembers(members.map((acc) => acc.toString()));
  };

  const handleGetOpenCalls = async () => {
    if (!saturn) return;

    if (!id?.toString()) return;

    const openCalls = await saturn.getPendingCalls(id);

    setOpenCalls(openCalls);
  };

  const handleBridge = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const amount = new BN(e.currentTarget?.tnkr.value).mul(new BN("1000000000000"));

    if (!api) return;
    if (!saturn) return;
    if (!selectedAccount) return;
    if (!id?.toString()) return;
    if (!details) return;

    const address = selectedAccount.address;
    const signer = (await web3FromAddress(address)).signer;

    const ksm = saturn.chains.find(chain => chain.chain === "Kusama")?.assets[0].registerType;

    if (!ksm) return;

    const result = await saturn.buildMultisigCall({
      id,
      proposalMetadata: "bridge",
      call: api.tx.xTokens.transfer(
        0,
        amount,
        {
          V1: {
            parents: 1,
            interior: {
              X2: [
                { Parachain: 2090 },
                {
                  AccountId32: {
                    network: "Any",
                    id: details.account,
                  },
                },
              ],
            },
          },
        },
        'Unlimited'
      ),
    }).signAndSend(address, signer);

    // const result = await saturn
    //     .bridgeXcmAsset({
    //         id,
    //         asset: ksm,
    //         amount: ksmAmount,
    //         destination: "Basilisk",
    //         fee: new BN("2000000000000"),
    //         proposalMetadata: "bridge"
    //     })
    //     .signAndSend(address, signer);

    console.log("result toHuman: ", result.toHuman());

    setLastCallResult(result);
  };

  const handleSwap = async (
    e: FormEvent<HTMLFormElement>,
    inputAsset: string,
  ) => {
    e.preventDefault();

    const assetIn = inputAsset === "tnkr" ? 9 : 0;
    const assetOut = inputAsset === "tnkr" ? 0 : 9;

    const amount = new BN(e.currentTarget?.amount.value).mul(new BN("1000000000000"));

    if (!api) return;
    if (!saturn) return;
    if (!selectedAccount) return;
    if (!id?.toString()) return;
    if (!bsxApi) return;

    const swapCall = bsxApi.tx.router.sell(assetIn, assetOut, amount, 0, [{ pool: "XYK", assetIn, assetOut }]);

    console.log("swapCall: ", u8aToHex(swapCall.unwrap().toU8a()));

    const address = selectedAccount.address;
    const signer = (await web3FromAddress(address)).signer;

    const bsx = saturn
      .chains
      .find(chain => chain.chain === "Basilisk")
      ?.assets
      .find(({ label }: { label: string }) => label == "BSX")
      ?.registerType;

    if (!bsx) return;

    const result = await saturn
      .sendXCMCall({
        id,
        destination: "Basilisk",
        fee: new BN("500000000000000"),
        feeAsset: bsx,
        weight: new BN("5000000000"),
        callData: swapCall.unwrap().toU8a(),
        proposalMetadata: "swap"
      })
      .signAndSend(address, signer);

    console.log("result toHuman: ", result.toHuman());

    setLastCallResult(result);
  };

  const processBsxSwap = (call: Uint8Array): { assetIn: string, assetOut: string, amountIn: BN } => {
    if (!bsxApi) return { assetIn: "", assetOut: "", amountIn: new BN("") };

    console.log("call hex: ", u8aToHex(call));
    const swapCall = bsxApi.createType('Call', u8aToHex(call));

    console.log("extrinsicCall: ", swapCall.toHuman());

    const amountIn = new BN(swapCall.args[2].toPrimitive() as string);

    const assetInId = swapCall.args[0].toPrimitive() as number;
    const assetOutId = swapCall.args[1].toPrimitive() as number;

    const assetIn = assetInId == 9 ? "TNKR" : "BSX";
    const assetOut = assetOutId == 9 ? "TNKR" : "BSX";

    return { assetIn, assetOut, amountIn };
  }

  const handleVote = async (aye: boolean) => {
    if (!latestCall || !saturn || !selectedAccount || !id?.toString()) return;

    const callHash = latestCall.callHash;

    const injector = await web3FromAddress(selectedAccount.address);

    saturn
      .vote({ id, callHash, aye })
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ events }) => {
          console.log(events.map((event) => event.toHuman()));
        }
      );
  };

  const handleGetTNKRBalance = async () => {
    if (!selectedAccount) return;

    if (!api) return;

    const balance = await api.query.system.account(selectedAccount.address);
  };

  const setupSubscriptions = ({ api, id }: { api: ApiPromise, id: number }) => {
    api.rpc.chain.subscribeNewHeads((_) => {
      saturn?.getPendingCalls(id).then((res) => {
        if (res[0]) {
          setLatestCall(res[0]);
        } else {
          setLatestCall(null)
        }
      })
    });
  }

  useEffect(() => {
    if (!api) {
      setup();
    }
  }, [api]);

  useEffect(() => {
    handleGetTNKRBalance();
  }, [selectedAccount, api]);

  useEffect(() => {
    if (!saturn) return;

    if (destTransfer.chain) return;

    const c = saturn.chains[0];

    if (c) {
      setDestTransfer(c);
      setAssetTransfer(c.assets[0]);
    }
  }, [saturn]);

  useEffect(() => {
    console.log("id changed");

    if (api && id?.toString() && !subsSetUp) {

      console.log("id exists, subsSetUp is false");

      setupSubscriptions({ api, id });

      setSubsSetUp(true);
    }
  }, [id]);

  return (
    <ChakraProvider>
      <div className="flex flex-col p-8 items-center mx-auto">
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
              {!id?.toString() ? (
                <>
                  <div className="w-full flex justify-center items-center">
                    <button
                      className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
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
                  {userMultisigs.length > 0 ? (
                    <>
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
                                setSelectedMultisig(parseInt(e.target.value));
                              }}
                              className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-500 focus:ring-neutral-500 sm:text-sm"
                            >
                              {userMultisigs.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
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
                </>
              ) : null}

              <Grid
                templateColumns='repeat(2, 1fr)'
                templateRows='repeat(4, 1fr)'
                templateAreas={`"header header"
                            "ops data"
                            "ops data"
                            "ops data"`}
                gap={6}
              >

                <GridItem area={"header"}>

                  {id?.toString() ? (
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
                          <b>Account:</b> {details.account.toHuman()}
                        </p>
                        <p>
                          <b>Minimum support:</b>{" "}
                          {api.registry
                            .createType("Perbill", details.minimumSupport.toNumber())
                            .toHuman()}
                        </p>
                        <p>
                          <b>Required approval:</b>{" "}
                          {api.registry
                            .createType(
                              "Perbill",
                              details.requiredApproval.toNumber()
                            )
                            .toHuman()}
                        </p>
                      </div>
                    </div>
                  ) : null}

                </GridItem>

                <GridItem area={"ops"}>

                  {id?.toString() && saturn ? (
                    <div className="w-full flex flex-col gap-4 justify-center items-center">
                      <div className="border rounded-md p-4 w-full flex gap-4">
                        <form
                          className="flex w-full flex-col gap-4"
                          onSubmit={handleBridge}
                        >
                          <div>
                            <FormLabel>TNKR -{'>'} Basilisk</FormLabel>
                            <div className="mt-1">
                              <NumberInput id="tnkr">
                                <NumberInputField />
                              </NumberInput>
                            </div>
                          </div>
                          <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">Bridge</button>
                        </form>
                      </div>
                    </div>
                  ) : null}

                  {id?.toString() && saturn ? (
                    <div className="w-full flex flex-col gap-4 justify-center items-center">
                      <div className="border rounded-md p-4 w-full flex gap-4">
                        <form
                          className="flex w-full flex-col gap-4"
                          onSubmit={(e) => handleSwap(e, "tnkr")}
                        >
                          <div>
                            <FormLabel>TNKR</FormLabel>
                            <div className="mt-1">
                              <NumberInput id="amount">
                                <NumberInputField />
                              </NumberInput>
                            </div>
                          </div>

                          <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                            Swap for BSX
                          </button>
                        </form>
                      </div>

                      <div className="border rounded-md p-4 w-full flex gap-4">
                        <form
                          className="flex w-full flex-col gap-4"
                          onSubmit={(e) => handleSwap(e, "bsx")}
                        >
                          <div>
                            <FormLabel>BSX</FormLabel>
                            <div className="mt-1">
                              <NumberInput id="amount">
                                <NumberInputField />
                              </NumberInput>
                            </div>
                          </div>

                          <button className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800">
                            Swap for TNKR
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : null}

                </GridItem>

                <GridItem area={"data"}>

                  {multisigMembers && saturn ? (
                    <div className="w-full flex flex-col gap-4 justify-center items-center">
                      <div className="border rounded-md p-4 w-full">
                        <div>
                          <p><b>Members:</b></p>
                          {multisigMembers.map((m) => (
                            <p key={m}>{m}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {latestCall ? (
                    <div className="w-full flex flex-col gap-4 justify-center items-center">
                      <div className="border rounded-md p-4 w-full">
                        <p>
                          <b>Call Hash:</b> {latestCall.callHash.toString()}
                        </p>
                        <p>
                          <b>Call:</b>
                        </p>
                        <pre>
                          {
                            function a() {
                              const meta = (latestCall.details.toHuman() as { proposalMetadata: string }).proposalMetadata;
                              console.log("meta: ", latestCall.details.toHuman())

                              switch (meta) {
                                case "bridge":
                                  return (
                                    <div>
                                      <p><b>Bridge</b></p>
                                      <p>{new BN(latestCall.details.actualCall.args[1].toPrimitive() as string).div(new BN("1000000000000")).toString()} TNKR</p>
                                      <p>From Tinkernet</p>
                                      <p>To Basilisk</p>
                                    </div>
                                  );
                                case "swap":
                                  const sub = latestCall.details.actualCall.args[4].toU8a();
                                  const { assetIn, assetOut, amountIn } = processBsxSwap(sub.slice(1));
                                  return (
                                    <div>
                                      <p><b>Swap</b></p>
                                      <p>{amountIn.div(new BN("1000000000000")).toString()} {assetIn}</p>
                                      <p>To {assetOut}</p>
                                    </div>
                                  );
                                default:
                                  return null;
                              }
                            }()}
                        </pre>
                      </div>
                    </div>
                  ) : null}

                  {latestCall && selectedAccount ? (
                    <div className="w-full flex flex-col gap-4 justify-center items-center">
                      <div className="border rounded-md p-4 w-full flex gap-4 flex-wrap">
                        <button
                          className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                          onClick={() => handleVote(true)}
                        >
                          Vote Aye
                        </button>
                        <button
                          className="shadow-sm py-2 px-4 rounded-md transition-all duration-300 bg-neutral-900 text-neutral-50 hover:shadow-lg hover:bg-neutral-800"
                          onClick={() => handleVote(false)}
                        >
                          Vote Nay
                        </button>
                      </div>
                    </div>
                  ) : null}
                </GridItem>
              </Grid>
            </>
          ) : null}
        </>
      </div>
    </ChakraProvider>
  );
};

export default Demo;
