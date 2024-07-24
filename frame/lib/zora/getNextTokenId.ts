import { Address } from 'viem';
import { getPublicClient } from '../clients/viem.js';
import { zora } from 'viem/chains';
import { zora1155Implementation } from '../abi/zora1155Implementation.js';

const getNextTokenId = async (collectionAddress: Address) => {
  const publicClient = getPublicClient(zora.id);
  const response = await publicClient.readContract({
    address: collectionAddress,
    abi: zora1155Implementation,
    functionName: 'nextTokenId',
  });

  return response;
};

export default getNextTokenId;
