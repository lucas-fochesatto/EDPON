import { createCollectorClient } from "@zoralabs/protocol-sdk";

type mintArgs = {
    chainId: any;
    publicClient: any;
    collectionAddress: `0x${string}`;
    tokenId: number;
    mintReferral: `0x${string}`;
    minterAccount: `0x${string}`;
}

// throws error if not first minted before
export default async function mint({ chainId, publicClient, collectionAddress, tokenId, mintReferral, minterAccount } : mintArgs) {
    const collectorClient = createCollectorClient({ chainId, publicClient });

    const { parameters } = await collectorClient.mint({
        // collection address to mint
        tokenContract: collectionAddress,
        // quantity of tokens to mint
        quantityToMint: 1,
        // can be set to 1155, 721, or premint
        mintType: "1155",
        // the id of the token to mint
        tokenId,
        // optional address that will receive a mint referral reward
        mintReferral,
        // the address to mint the token to
        minterAccount
    });

    return parameters; // use writeContract(parameters) on frontend
}