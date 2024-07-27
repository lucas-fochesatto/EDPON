import { ArtCollectionType } from "@/app/createToken/page";

type TokenType = {
    tokenURI: any;
    quantity: bigint;
}

export default function Token({ token, collection } : { token: TokenType; collection : ArtCollectionType } ) {
  return (
    <div className="rounded-lg overflow-hidden group relative aspect-square">
        <div className="rounded-lg flex flex-col gap-1 items-center justify-center absolute w-full aspect-square invisible group-hover:visible bg-black opacity-50">
            <p className="text-center font-bold text-white text-xs">{token.tokenURI.name}</p>
            <p className="text-center font-bold text-white text-xs">{token.quantity.toString()} minted</p>
        </div>
        <img 
            src = {
                collection.createdByEDPON ?
                `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${token.tokenURI.image.split('/')[2]}` 
                :
                `https://ipfs.decentralized-content.com/ipfs/${token.tokenURI.image.split('/')[2]}`
            }
            alt="token" className="aspect-square object-cover"
        />
        
    </div>
  )
}