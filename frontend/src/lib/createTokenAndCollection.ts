import { createCreatorClient } from "@zoralabs/protocol-sdk";
import { createWalletClient, custom } from "viem";
import { zora } from "viem/chains";

type createTokenAndCollectionArgs = {
    address: `0x${string}`; // get by useAccount wagmi hook
    chainId: any;// get by useChainId wagmi hook
    publicClient: any; // get by usePublicClient wagmi hook
    contract: {
        contractAdmin: `0x${string}`,
        contractName: string;
        contractURI: string;
    }
    token: {
        tokenURI: string;
        payoutRecipient: `0x${string}`;
        createReferral: `0x${string}`;
    },
}

export default async function createTokenAndCollection({ address, chainId, publicClient, contract, token } : createTokenAndCollectionArgs) {
    const creatorClient = createCreatorClient({ chainId, publicClient });

    const { signAndSubmit, collectionAddress, premintConfig } = await creatorClient.createPremint({
        // by providing a contract creation config, the contract will be created
        // if it does not exist at a deterministic address
        contract,
        token
    });

    const walletClient = createWalletClient({
        chain: zora,
        transport: custom(window.ethereum!)
    })

    await signAndSubmit({
        account: address!,
        walletClient,
        checkSignature: true
    })

    return { collectionAddress, premintConfig };
}