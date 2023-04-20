import { BN } from "@polkadot/util";
import { ApiPromise } from "@polkadot/api";
import { Option, StorageKey, bool } from "@polkadot/types";
import { XcmV1MultiLocation } from "@polkadot/types/lookup";

const getChainsUnderMaintenance = ({ api }: { api: ApiPromise }): Promise<[StorageKey<[XcmV1MultiLocation]>, Option<bool>][]> => {
  return api.query.rings.chainsUnderMaintenance.entries();
};

export { getChainsUnderMaintenance };
