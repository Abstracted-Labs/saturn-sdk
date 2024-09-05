import { ApiPromise } from "@polkadot/api";
import { Option, StorageKey, bool } from "@polkadot/types";
import { StagingXcmV3MultiLocation } from "@polkadot/types/lookup";

const getChainsUnderMaintenance = ({
  api,
}: {
  api: ApiPromise;
}): Promise<[StorageKey<[StagingXcmV3MultiLocation]>, Option<bool>][]> => {
  return api.query.rings.chainsUnderMaintenance.entries();
};

export { getChainsUnderMaintenance };
