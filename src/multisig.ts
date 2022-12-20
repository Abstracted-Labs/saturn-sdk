// receive ApiPromise and setup the class
// check if ApiPromise contains inv4 and all its params
// return functions with this class inside
// returns error if ApiPromise is not correct

import { ApiPromise } from "@polkadot/api";

import {
  createMultisigCall,
  CreateMultisigCallParams,
  getPendingMultisigCalls,
  GetPendingMultisigCallsParams,
  voteMultisigCall,
  VoteMultisigCallParams,
  withdrawVoteMultisigCall,
  WithdrawVoteMultisigCallParams,
} from "./";

class Multisig {
  readonly api: ApiPromise;
  readonly id: string;

  constructor({ api, id }: { api: ApiPromise; id: string }) {
    if (!api.tx.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for extrinsics");
    }

    if (!api.query.inv4) {
      throw new Error("ApiPromise does not contain inv4 module for queries");
    }

    if (!api.tx.inv4.createIps) {
      throw new Error("ApiPromise does not contain inv4.createIps extrinsics");
    }

    if (!api.tx.inv4.operateMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.operateMultisig extrinsics"
      );
    }

    if (!api.query.inv4.ipStorage) {
      throw new Error("ApiPromise does not contain inv4.ipStorage query");
    }

    if (!api.query.inv4.multisigs) {
      throw new Error("ApiPromise does not contain inv4.multisigs query");
    }

    if (!api.tx.inv4.voteMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.voteMultisig extrinsics"
      );
    }

    if (!api.tx.inv4.withdrawVoteMultisig) {
      throw new Error(
        "ApiPromise does not contain inv4.withdrawVoteMultisig extrinsics"
      );
    }

    this.api = api;
    this.id = id;
  }

  createCall = ({ ...params }: Omit<CreateMultisigCallParams, "api">) => {
    return createMultisigCall({ api: this.api, ...params });
  };

  getPendingCalls = ({
    ...params
  }: Omit<GetPendingMultisigCallsParams, "api">) => {
    return getPendingMultisigCalls({ api: this.api, ...params });
  };

  vote = ({ ...params }: VoteMultisigCallParams) => {
    return voteMultisigCall({ api: this.api, ...params });
  };

  withdrawVote = ({ ...params }: WithdrawVoteMultisigCallParams) => {
    return withdrawVoteMultisigCall({ api: this.api, ...params });
  };
}

export { Multisig };
