import fetchTokens from "./fetchTokens";

type firstMintArgs = {
    address: `0x${string}`;
    mintReferral: `0x${string}`;
    collectionAddress: `0x${string}`;
    chainId: any;
    publicClient: any;
}

export default async function firstMint({ address, mintReferral, collectionAddress, chainId, publicClient } : firstMintArgs) {
    const tokens = await fetchTokens({ collectionAddress, chainId, publicClient })

    const lastToken = tokens?.tokens[tokens?.tokens.length - 1];

    if(lastToken.token.creator !== "0x0000000000000000000000000000000000000000") {
        throw new Error("Token has already been minted")
    }

    const { parameters } = lastToken.prepareMint({
        minterAccount: address!,
        quantityToMint: 1,
        mintReferral
    })

    return parameters; // use writeContract(parameters) on frontend
}