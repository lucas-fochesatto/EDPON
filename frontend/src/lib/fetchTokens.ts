import { createCollectorClient } from "@zoralabs/protocol-sdk";

type fetchTokensArgs = {
    collectionAddress: `0x${string}`;
    chainId: any;
    publicClient: any;
}

export default async function fetchTokens({ collectionAddress, chainId, publicClient } : fetchTokensArgs) {
    const collectorClient = createCollectorClient({ chainId, publicClient });

    const tokens = await collectorClient.getTokensOfContract({
        tokenContract: collectionAddress,
    });

    return tokens;
}