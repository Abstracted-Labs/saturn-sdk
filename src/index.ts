import { web3FromAddress } from "@polkadot/extension-dapp";
import { ISubmittableResult } from "@polkadot/types/types";
import {
  GenerateMultisigParams,
  GetMultisigParams,
  Multisig,
  MultisigStatus,
} from "./types";

const generateMultisig = async ({
  id,
  signer,
  threshold,
  defaultAssetWeight,
  defaultPermission,
  includeCaller = true,
  calls,
  metadata,
  api,
  onInvalid,
  onExecuted,
  onCancelled,
  onSuccess,
  onLoading,
  onDropped,
  onError,
}: GenerateMultisigParams): Promise<Multisig> => {
  const injector = await web3FromAddress(signer);

  await api.tx.inv4
    .operateMultisig(
      includeCaller,
      [id, null],
      JSON.stringify(metadata),
      api.tx.utility.batchAll(calls)
    )
    .signAndSend(
      signer,
      { signer: injector.signer },
      ({ events, status }: ISubmittableResult) => {
        if (status.isInvalid) {
          if (onInvalid) onInvalid();
        } else if (status.isReady) {
          if (onLoading) onLoading();
        } else if (status.isDropped) {
          if (onDropped) onDropped();
        } else if (status.isInBlock || status.isFinalized) {
          const multisigVoteStarted = events.find(
            ({ event }) => event.method === "MultisigVoteStarted"
          );

          const multisigExecuted = events.find(
            ({ event }) => event.method === "MultisigExecuted"
          );

          const failed = events.find(
            ({ event }) => event.method === "ExtrinsicFailed"
          );

          if (multisigExecuted) {
            if (onSuccess) onSuccess();
          } else if (multisigVoteStarted) {
            if (onSuccess) onSuccess();
          } else if (failed) {
            if (onError) onError();

            console.error(failed.toHuman(true));
          } else throw new Error("UNKNOWN_RESULT");
        }
      }
    );

  return getMultisig({
    api,
    id,
  });
};

const getMultisig = async ({
  id,
  api,
}: GetMultisigParams): Promise<Multisig> => {
  let status: MultisigStatus = "OPEN";

  const addVote = async (address: string) => {};

  const removeVote = async (address: string) => {};

  const listOpenCalls = async () => [];

  const addNewCall = async (payload: {
    id: string;
    call: () => Promise<void>;
  }) => {};

  const removeCall = async (id: string) => {};

  const getBalance = async () => {
    return {
      limit: 100,
      filled: 50,
      total: 150,
    };
  };

  const getVoteWeight = async (address: string) => {
    return 100;
  };

  return {
    status,
    addVote,
    removeVote,
    listOpenCalls,
    addNewCall,
    removeCall,
    getBalance,
    getVoteWeight,
  };
};
