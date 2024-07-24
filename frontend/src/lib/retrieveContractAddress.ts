import { createCreatorClient } from "@zoralabs/protocol-sdk";

type retrieveContractAddressArgs = {
    chainId: any;// get by useChainId wagmi hook
    publicClient: any; // get by usePublicClient wagmi hook
    contract: {
        contractAdmin: `0x${string}`,
        contractName: string;
        contractURI: string;
    }
    token: {
        tokenURI: string;
        maxSupply: bigint;
        payoutRecipient: `0x${string}`;
        createReferral: `0x${string}`;
    },
}

export default async function retrieveContractAddress({ chainId, publicClient, contract, token } : retrieveContractAddressArgs) {
    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { collectionAddress } = await creatorClient.createPremint({
        // by providing a contract creation config, the contract will be created
        // if it does not exist at a deterministic address
        contract,
        token
    });

    return collectionAddress;
}