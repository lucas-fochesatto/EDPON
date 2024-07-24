import { zora1155Implementation } from '../abi/zora1155Implementation.js';
import { getPublicClient } from '../clients/viem.js';
import { zora } from 'viem/chains';
import { Address } from 'viem';

const getUri = async (collection: Address, tokenId: bigint = 1n) => {
  const publicClient = getPublicClient(zora.id);

  const response = await publicClient.readContract({
    address: collection,
    abi: zora1155Implementation,
    functionName: 'uri',
    args: [tokenId],
  });
  return response;
};

export default getUri;
