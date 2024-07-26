import { ArtCollectionType } from "@/app/createToken/page";
import fetchTokens from "@/lib/fetchTokens";

type fetchTokensFromCollectionArrayArgs = {
    collections: ArtCollectionType[];
    chainId: any;
    publicClient: any;
}

export default async function fetchTokensFromCollectionArray({ collections, chainId, publicClient } : fetchTokensFromCollectionArrayArgs) {
    let tokens : any = [];
    let i = 0;

    for(const collection of collections) {
        const collectionAddress = collection.artCollectionAddress;
        const collectionTokens = await fetchTokens({ collectionAddress, chainId, publicClient });
        const createdByEDPON = collection.createdByEDPON;

        const fetchImage = async (uri : string) => {
          if(createdByEDPON) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${uri.split('ipfs://')[1]}`);
            const data = await res.json();
            return data;
          } else {
            const res = await fetch(`https://ipfs.decentralized-content.com/ipfs/${uri.split('ipfs://')[1]}`);
            const data = await res.json();
            return data;
          }
        }

        if(!(collectionTokens as any).tokens ) {
          tokens = [...tokens, {
            tokens: []
          }];
          continue;
        }

        const handledPromisses = await Promise.all((collectionTokens as any).tokens.map(async (token : any) => ({ tokenURI: await fetchImage(token.token.tokenURI), quantity: token.token.totalMinted })))

        tokens = [...tokens, {
          tokens: [...handledPromisses]
        }];
    }

    return tokens;
}