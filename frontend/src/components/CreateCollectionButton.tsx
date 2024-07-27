import Loading from "./Loading";

type CreateCollectionButtonProps = {
  isLoading: boolean;
  message: string;
  handleCreateCollection: () => void;
}

export default function CreateCollectionButton({ isLoading, message, handleCreateCollection } : CreateCollectionButtonProps) {
  return (
    <button
      className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2"
      onClick={handleCreateCollection}
      disabled={isLoading}
    >
      {isLoading ? 
        <div className="flex items-center gap-2">
          <p>{message}</p>
          <Loading color="white" />
        </div> : 'Create collection'}
    </button>
  )
}