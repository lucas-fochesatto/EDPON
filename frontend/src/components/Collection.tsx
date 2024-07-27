import { ArtCollectionType } from "@/app/createToken/page";

type CollectionComponentType = {
    collection: ArtCollectionType;
    isSelected: boolean;
    index: number;
    setSelectedCollectionIndex: (index: number) => void;
}

export default function Collection({ collection, isSelected, index, setSelectedCollectionIndex } : CollectionComponentType) {
  return (
    <div 
      onClick={() => setSelectedCollectionIndex(index)} 
      className={`rounded-lg overflow-hidden group relative aspect-square cursor-pointer`}
    >
        <div className={`${isSelected ? 'visible' : 'invisible'} rounded-lg flex flex-col gap-1 items-center justify-center absolute w-full aspect-square group-hover:visible bg-black opacity-50`}>
            <p className="text-center font-bold text-white text-xs">{collection.collectionName}</p>
        </div>
        <img 
            src = {
                collection.createdByEDPON ?
                `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${collection.collectionCoverUrl.split('/')[2]}` 
                :
                `https://ipfs.decentralized-content.com/ipfs/${collection.collectionCoverUrl.split('/')[2]}`
            }
            alt="token" className="aspect-square object-cover"
        />
    </div>
  )
}