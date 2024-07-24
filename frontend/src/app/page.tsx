"use client"

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createCreatorClient, createCollectorClient, SubmitParams} from '@zoralabs/protocol-sdk';
import { useAccount, useChainId, usePublicClient, useSignTypedData, useWriteContract } from 'wagmi';
import { TypedDataDefinition } from 'viem';
import { PremintConfigV1, PremintConfigV2, PremintConfigV3 } from '@zoralabs/protocol-deployments';

export default function Home() {
  const chainId = useChainId();
  const publicClient = usePublicClient()!;
  const { address: creatorAddress } = useAccount();
  const { signTypedData, data: signature } = useSignTypedData();
  const { writeContract } = useWriteContract();

  const [typedDataDefinition, setTypedDataDefinition] = useState<TypedDataDefinition | null>(null);
  const [submitFunction, setSubmitFunction] = useState<(params: SubmitParams) => Promise<void>>();
  const [premintConfig, setPremintConfig] = useState<PremintConfigV1 | PremintConfigV2 | PremintConfigV3 | null>(null);
  const [collectionAddress, setCollectionAddress] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    if (chainId && publicClient && creatorAddress) {
      const creatorClient = createCreatorClient({ chainId, publicClient });

      creatorClient.createPremint({
        contract: {
          contractAdmin: "0xa9760110671d7a5a37A72F684D7D1d92F2dE84dA",
          contractName: 'Testing Contract',
          contractURI: 'ipfs://bafkreiainxen4b4wz4ubylvbhons6rembxdet4a262nf2lziclqvv7au3e',
        },
        token: {
          /* tokenURI: 'ipfs://bafkreice23maski3x52tsfqgxstx3kbiifnt5jotg3a5ynvve53c4soi2u', */
          tokenURI: 'ipfs://QmY9yW5B7xHXBGDwW5Y5ido3VULyXD2njD4QhApBqxtPxd',
          createReferral: "0xa9760110671d7a5a37A72F684D7D1d92F2dE84dA",
          // maximum number of tokens that can be minted.
          maxSupply: BigInt('50000'),
          // the maximum number of tokens that can be minted to a single address.
          maxTokensPerAddress: BigInt('10'),
          // the earliest time the premint can be brought onchain.  0 for immediate.
          mintStart: BigInt('0'),
          // the duration of the mint.  0 for infinite.
          mintDuration: BigInt('0'),
          // the price in eth per token, for paid mints.  0 for it to be a free mint.
          pricePerToken: BigInt('0'),
          payoutRecipient: '0xa9760110671d7a5a37A72F684D7D1d92F2dE84dA'
        },
      }).then(({ premintConfig, collectionAddress, typedDataDefinition, submit }) => {
        setPremintConfig(premintConfig);
        setCollectionAddress(collectionAddress);
        setTypedDataDefinition(typedDataDefinition);
        setSubmitFunction(() => submit);
      }).catch(error => {
        console.error('Error creating premint:', error);
      });
    }
  }, [chainId, publicClient, creatorAddress]);

  useEffect(() => {
    if (signature && submitFunction) {
      submitFunction({ signature });
    }
  }, [signature, submitFunction]);

  const handleMint = async () => {
    if(collectionAddress && premintConfig) {
      const collectorClient = createCollectorClient({ chainId, publicClient });

      const { token, prepareMint } = await collectorClient.getToken({
        tokenContract: collectionAddress,
        uid: premintConfig.uid,
        mintType: 'premint'
      })

      const { parameters, costs } = prepareMint({
        minterAccount: creatorAddress!,
        quantityToMint: BigInt('1'),
      });

      writeContract(parameters)
    }
  }

  const handleCreate = () => {
    if (typedDataDefinition) {
      signTypedData(typedDataDefinition);
    } else {
      console.error('Typed data not ready');
    }
  }

  const handleSecondMint = async () => {
    // set to the chain you want to interact with
    const collectorClient = createCollectorClient({ chainId, publicClient });

    const { parameters } = await collectorClient.mint({
      // collection address to mint
      tokenContract: collectionAddress!,
      // quantity of tokens to mint
      quantityToMint: 1,
      // can be set to 1155, 721, or premint
      mintType: "1155",
      // the id of the token to mint
      tokenId: 3,
      // optional address that will receive a mint referral reward
      mintReferral: "0x92093eD2F7417664A48Acd4515206FEd0D5836CC",
      // the address to mint the token to
      minterAccount: creatorAddress!,
    });

    writeContract(parameters)
  }

  return (
    <div className='flex flex-col items-center p-10 gap-8'>
      <h1 className='text-3xl'>Bem-vindo!</h1>
      
      <ConnectButton />

      <button onClick={handleCreate}>Create</button>

      {premintConfig && (
        <div>
          <h2>Premint Config UID</h2>
          <p>{premintConfig.uid}</p>
        </div>
      )}

      {collectionAddress && (
        <div>
          <h2>Collection Address</h2>
          <p>{collectionAddress}</p>
        </div>
      )}

      <button onClick={handleMint}>Mint</button>

      <button onClick={handleSecondMint}>Second Mint</button>
    </div>
  );
}