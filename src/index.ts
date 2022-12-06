import "@polkadot/api-augment";

import { web3FromAddress } from "@polkadot/extension-dapp";
import type { ISubmittableResult } from "@polkadot/types/types";
import type { GenerateMultisigParams } from "./types";

const getSignAndSendCallback = ({
  onDropped,
  onError,
  onExecuted,
  onInvalid,
  onLoading,
  onSuccess,
}: Pick<
  GenerateMultisigParams,
  | "onDropped"
  | "onError"
  | "onExecuted"
  | "onInvalid"
  | "onLoading"
  | "onSuccess"
>) => {
  return ({ events, status }: ISubmittableResult) => {
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

    if (onExecuted) onExecuted();
  };
};

const generateMultisig = async ({
  signer,
  defaultAssetWeight,
  defaultPermission,
  executionThreshold,
  allowReplica,
  license,
  metadata,
  api,
  onInvalid,
  onExecuted,
  onSuccess,
  onLoading,
  onDropped,
  onError,
}: GenerateMultisigParams): Promise<void> => {
  const injector = await web3FromAddress(signer);

  await api.tx.inv4
    .createIps(
      JSON.stringify(metadata),
      metadata?.fork?.data ? metadata.fork.data : [],
      allowReplica,
      api.createType("Licenses", license),
      api.createType("OneOrPercent", { Percent: executionThreshold }),
      api.createType("OneOrPercent", { Percent: defaultAssetWeight }),
      defaultPermission
    )
    .signAndSend(
      signer,
      { signer: injector.signer },
      getSignAndSendCallback({
        onDropped,
        onError,
        onExecuted,
        onInvalid,
        onLoading,
        onSuccess,
      })
    );
};

export { generateMultisig };