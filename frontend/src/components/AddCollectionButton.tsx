import { PlusIcon } from "lucide-react";

type CollectionComponentType = {
    isSelected: boolean;
    index: number;
    setSelectedCollectionIndex: (index: number) => void;
}

export default function AddCollectionButton({ isSelected, index, setSelectedCollectionIndex } : CollectionComponentType) {
  return (
    <div 
      onClick={() => setSelectedCollectionIndex(index)} 
      className='flex flex-col items-center justify-center rounded-lg overflow-hidden group relative aspect-square cursor-pointer'
    >
        <div className={`${isSelected ? 'visible' : 'invisible'} rounded-lg flex flex-col gap-1 items-center justify-center absolute w-full aspect-square group-hover:visible bg-black opacity-50`}></div>
        <PlusIcon size={24} />
        <p className="text-center text-black text-sm">Add collection</p>
    </div>
  )
}