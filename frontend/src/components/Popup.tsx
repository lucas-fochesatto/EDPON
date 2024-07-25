'use client'

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function Popup({ onClose }: { onClose: () => void }) {
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [signupForm, setSignupForm] = useState(false);
  const [userName, setUserName] = useState('')

  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async ()  => {
      if(address) {
        const response = await fetch(`${apiUrl}/get-creator/${address}`);

        setLoading(false);

        if(response.status == 404) {
          // open signup form
          setSignupForm(true);
          return
        }

        if(response.status == 200) {
          const data = await response.json();
          
          localStorage.setItem('userId', data.creatorId)

          // redirect
          router.push('/createToken')
        }
      }
    }

    fetchUser();
  }, [])

  const handleCreateAccount = async () => {
    if(!loading) {
      setLoadingCreate(true);
  
      const response = await fetch(`${apiUrl}/create-creator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet: address,
          name: userName
        })
      })
  
      if(response.status == 200) {
        const data = await response.text()
  
        localStorage.setItem('userId', data)
  
        router.push('/createToken')
      }
    }
  }

  return  (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[1000] backdrop-blur-sm">
      <div className="w-[40%] flex flex-col items-center justify-center bg-white p-8 rounded-md shadow-md text-black">
        {
          loading ?
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="black" stroke-width="4"></circle>
              <path className="opacity-75" fill="black" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          :
          <div className="w-full flex flex-col gap-4 items-center justify-center">
            { signupForm ? 
              <>
                <div className="relative flex flex-col items-center gap-1 w-full">
                  <div className="absolute top-2 left-0 cursor-pointer" onClick={onClose}>
                    <X size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Create your account</h2>
                  <p className="text-base">Just choose a username!</p>
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <h2 className="text-xs">Wallet</h2>
                    <input type="text" name="address" value={address} contentEditable={false} disabled className="w-full cursor-not-allowed bg-[rgb(255,239,228)] text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <h2 className="text-xs">Username</h2>
                    <input type="text" name="address" value={userName} onChange={(e) => {setUserName(e.target.value)}} className="w-full bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                </div>
                <button onClick={handleCreateAccount} className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2">
                  { loadingCreate ? 
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"></circle>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg> : 'Create' }
                </button>
              </>
              :
              <>
                <div className="flex flex-col items-center gap-1 w-full">
                  <h2 className="text-2xl font-bold">Redirecting...</h2>
                </div>
              </>
            }
          </div>
        }
      </div>
    </div>
  )
}