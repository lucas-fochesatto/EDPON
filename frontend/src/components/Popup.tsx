export default function Popup({ onClose }: { onClose: () => void }) {
  return  (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[1000] backdrop-blur-sm">
      <div className="bg-white p-8 rounded-md shadow-md">
        <h1>Popup content</h1>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}