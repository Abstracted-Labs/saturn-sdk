import { ApiPromise } from "@polkadot/api";
import { Option, StorageKey, bool } from "@polkadot/types";
import { XcmV3MultiLocation } from "@polkadot/types/lookup";

const getChainsUnderMaintenance = ({
  api,
}: {
  api: ApiPromise;
}): Promise<[StorageKey<[XcmV3MultiLocation]>, Option<bool>][]> => {
  return api.query.rings.chainsUnderMaintenance.entries();
};

export { getChainsUnderMaintenance };
