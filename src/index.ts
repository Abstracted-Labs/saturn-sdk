import { GenerateMultisigParams, GetMultisigParams, Multisig } from "./types";

const generateMultisig = async ({
  threshold,
  defaultAssetWeight,
  defaultPermission,
  api,
}: GenerateMultisigParams): Promise<Multisig> => {
  return () => ({});
};

const getMultisig = async ({
  address,
  api,
}: GetMultisigParams): Promise<Multisig> => {
  return () => ({});
};
