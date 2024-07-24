import { Chain, createPublicClient, http } from "viem"
import getViemNetwork from "./getViemNetwork"
import { sepolia } from 'viem/chains';
import getViemNetwork from "./clients/getViemNetwork.js"

export const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

export const getPublicClient = (chainId: number) => {
  const chain = getViemNetwork(chainId)
  const publicClient = createPublicClient({
    chain: chain as Chain,
    transport: http(),
  })
  return publicClient
}