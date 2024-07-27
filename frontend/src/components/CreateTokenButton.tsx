import Loading from "./Loading";

type CreateTokenButtonProps = {
  isLoading: boolean;
  message: string;
  handleCreateToken: () => void;
}

export default function CreateTokenButton({ isLoading, message, handleCreateToken } : CreateTokenButtonProps) {
  return (
    <button
      className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2"
      onClick={handleCreateToken}
      disabled={isLoading}
    >
      {isLoading ? 
        <div className="flex items-center gap-2">
          <p>{message}</p>
          <Loading color="white" />
        </div> : 'Submit'}
    </button>
  )
}