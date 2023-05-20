# Saturn

## Overview

Saturn is a powerful multisig protocol that leverage no-code account abstraction to provide a seamless experience across different chains, here are some of the unique aspects of Saturn multisigs:

1. **No Smart Contracts**: Saturn multisigs are native first-class citizens of InvArch's Kusama network, Tinkernet, and thus do not require users to deploy redundant smart contracts, as all the code is already built-in to the network, making every single operation incredibly efficient on both performance and cost.

2. **Fungible Voting Tokens**: Multisigs deployed using Saturn have a simple yet effective voting system, this consists of fungible voting tokens (which are frozen by default, but can be made transferable), these tokens represent the voting power of each member of the multisig, so they can be minted in different amounts to different members to represent unique ratios of voting power. This also means that, while this SDK uses the terminology "add member" and "remove member", technically speaking that's simply an abstraction for token minting and burning.

3. **Cross Chain Execution**: Saturn multisigs are not limited to the Tinker network, but also cannot be deployed to other networks, that's because the protocol utilizes Polkadot's XCM (Cross Consensus Messaging) to execute transactions in chains connceted to Tinkernet. This is a seamless process for developers using the SDK and for users of products built with it, and that's because the protocol constantly attempts to maintain user experience similar to EOAs (Externally Owned Accounts), the main thing to note is that Saturn multisigs have the same exact account address no matter which network they're transacting on!

4. **Flexible Management**: Saturn focuses on being as decentralized as possible, meaning that after someone creates a multisig, every single operation to manage that multisig has to be done by the multisig itself, so if members want to change parameters like the voting thresholds or unfreeze the tokens, they have to propose a multisig call that executes those transactions. By allowing the multisig to self-govern, we completely remove any point of trust from the protocol. 

Saturn's comprehensive set of features and user-friendly interface make it an ideal solution for a wide range of use cases, from decentralized organizations and consortiums to individual users seeking enhanced security and control over their digital assets.
