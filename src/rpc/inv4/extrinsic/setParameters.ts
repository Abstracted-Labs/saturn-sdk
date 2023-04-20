import { ApiPromise } from '@polkadot/api';
import { Perbill } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

const setParameters = ({
    api,
    id,
    metadata,
    minimumSupport,
    requiredApproval,
    frozenTokens,
}: {
    api: ApiPromise;
    id: number;
    metadata?: string | Uint8Array;
    minimumSupport?: Perbill | BN | number;
    requiredApproval?: Perbill | BN | number;
    frozenTokens?: boolean;
}) => {
    return api.tx.inv4.setParameters(
        metadata ? metadata : null,
        minimumSupport ? minimumSupport : null,
        requiredApproval ? requiredApproval : null,
        frozenTokens ? frozenTokens : null
    );
};

export { setParameters };
