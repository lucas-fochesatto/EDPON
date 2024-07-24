"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { createCreatorClient, createCollectorClient } from "@zoralabs/protocol-sdk";
import { useEffect, useState } from "react";
import { useChainId, usePublicClient, useAccount, useWriteContract } from "wagmi";

import { zoraSepolia } from "viem/chains";


import {
    protocolRewardsABI,
    zoraCreator1155FactoryImplABI,
    protocolRewardsAddress,
    zoraCreator1155FactoryImplAddress,
  } from "@zoralabs/protocol-deployments";
import { parseAbiParameters, parseEther } from "viem";

export default function Protocol() {
    const chainId = useChainId();
    const publicClient = usePublicClient()!;
    const { address } = useAccount();
    const { writeContract } = useWriteContract();

    const creatorClient = createCreatorClient({ chainId, publicClient });

    const [collectionAddress, setCollectionAddress] = useState<string | undefined>();
    const [minter, setMinter] = useState<string | undefined>();

    // initiate the collector client
    const collectorClient = createCollectorClient({ chainId, publicClient });

    const zoraCreator1155FactoryImplAddressOnZora = zoraCreator1155FactoryImplAddress[zoraSepolia.id];

    console.log(zoraCreator1155FactoryImplAddressOnZora)

    const defaultRoyaltyConfiguration = { // defaultRoyaltyConfiguration
        royaltyMintSchedule: 0,
        royaltyBPS: 500, // 5%
        royaltyRecipient: address, // Substitua pelo endereço do destinatário
    }

    const args = [
        'ipfs://bafkreiainxen4b4wz4ubylvbhons6rembxdet4a262nf2lziclqvv7au3e',
        'Colecao',
        defaultRoyaltyConfiguration,
        address,
        
    ]

    const handleMint = async () => {
        // 0x69F91A2A0bF40fc2f7398D4D3Ab98Ea56a1e5938
        const { parameters } = await collectorClient.mint({
            tokenContract: "0xb2F885eD55953FaE694C23f6c25c84CEE62337Dd",
            mintType: '1155',
            minterAccount: address!,
            quantityToMint: 1,
            tokenId: 1,
            mintReferral: "0x92093eD2F7417664A48Acd4515206FEd0D5836CC",
            mintRecipient: address
        })

        parameters.value = parseEther("0.000777")

        console.log(parameters)
        writeContract(parameters);
    }



    const handleCreateCollection = async () => {
        const { parameters, minter, collectionAddress } = await creatorClient.create1155({
            // by providing a contract creation config, the contract will be created
            // if it does not exist at a deterministic address
            contract: {
                // contract name
                name: "Collection",
                // contract metadata uri
                uri: "ipfs://QmSYS4Tv1hsQRGMRsvFKAFxwtiZEZK4UTr62c22RFtgAB3",
            },
            token: {
                tokenMetadataURI: "ipfs://QmY9yW5B7xHXBGDwW5Y5ido3VULyXD2njD4QhApBqxtPxd",
                createReferral: "0x92093eD2F7417664A48Acd4515206FEd0D5836CC",
                payoutRecipient: address!,
                mintToCreatorCount: 1,
                royaltyBPS: 500,
            },
            // account to execute the transaction (the creator)
            account: address!,
        });

        setCollectionAddress(collectionAddress);
        setMinter(minter);

        console.log(parameters)

        writeContract(parameters);
    }

    return (
        <div className="flex flex-col gap-8 items-center">
            <button onClick={handleCreateCollection}>Click</button>
            <button onClick={handleMint}>Mint</button>

            <h1>Collection address: {collectionAddress}</h1>
            <h1>Minter address: {minter}</h1>

            <ConnectButton/>
        </div>
    )
}