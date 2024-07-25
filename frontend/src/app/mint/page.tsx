"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useChainId, usePublicClient, useAccount, useWriteContract } from "wagmi";

import createTokenAndCollection from "@/lib/createTokenAndCollection";
import fetchTokens from "@/lib/fetchTokens";
import firstMint from "@/lib/firstMint";
import mint from "@/lib/mint";
import retrieveContractAddress from "@/lib/retrieveContractAddress";

export default function Mint() {
    const chainId = useChainId();
    const publicClient = usePublicClient()!;
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const contract = {
        contractAdmin: address!,
        // contract name
        contractName: "OLE OLE OLE OLA",
        // contract metadata uri
        contractURI: "ipfs://QmSYS4Tv1hsQRGMRsvFKAFxwtiZEZK4UTr62c22RFtgAB3",
    }

    const token = {
        tokenURI: "ipfs://bafkreice23maski3x52tsfqgxstx3kbiifnt5jotg3a5ynvve53c4soi2u",
        maxSupply: BigInt('100'),
        payoutRecipient: address!,
        createReferral: address!
    }

    const collectionAddress = async () => {
        const collection = await retrieveContractAddress({ chainId, publicClient, contract, token })

        console.log(collection)

        return collection;
    }

    const setupNewToken = async () => {
        const { collectionAddress: collection, premintConfig } = await createTokenAndCollection({ address: address!, chainId, publicClient, contract, token });

        console.log(collection, premintConfig)
    }

    const firstMintLastSetup = async () => {
        const danoWallet = "0xC1bd4Aa0a9ca600FaF690ae4aB67F15805d8b3A1"

        const parameters = await firstMint({ address: address!, mintReferral: danoWallet, collectionAddress: await collectionAddress(), chainId, publicClient });
    
        console.log(parameters)

        // writeContract(parameters)
    }

    
    const mintToken = async (tokenId : number) => {
        // remember that it needs to be first minted before
        const danoWallet = "0xC1bd4Aa0a9ca600FaF690ae4aB67F15805d8b3A1"

        // const parameters = await mint({ chainId, publicClient, collectionAddress: await collectionAddress(), tokenId, mintReferral: danoWallet, minterAccount: address! });
        const parameters = await mint({ chainId, publicClient, collectionAddress: '0xf2aeFC2Bb3EF8199FfA8E983a8E30a5796E6CB9d', tokenId, mintReferral: danoWallet, minterAccount: address! });

        console.log(parameters)

        // writeContract(parameters)
    }

    const fetchTokensFromCollection = async (collection : `0x${string}`) => {
        const tokens = await fetchTokens({ chainId, publicClient, collectionAddress: collection });

        console.log(tokens)

        return tokens;
    }

    return (
        <div className="flex flex-col gap-8 items-center">
            <button onClick={collectionAddress}>Retrieve collection address</button>
            <button onClick={setupNewToken}>Setup a new token</button>
            <button onClick={firstMintLastSetup}>First mint</button>
            <button onClick={() => mintToken(1)}>Mint tokenId 1</button>
            <button onClick={async () => await fetchTokensFromCollection(await collectionAddress())}>Get tokens from OLE OLE OLA collection</button>

            <ConnectButton/>
        </div>
    )
}