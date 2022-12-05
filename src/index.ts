import { MultisigParams, Multisig } from "./types";

const generateMultisig = ({
  threshold,
  defaultAssetWeight,
  defaultPermission,
  api,
}: MultisigParams): Multisig => {
  return () => ({});
};
