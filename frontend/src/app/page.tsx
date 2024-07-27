'use client'

import { useAccount } from "wagmi";
import Link from "next/link";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const { address } = useAccount();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="relative w-full h-[calc(100vh-72px-12vh)]  gap-8 overflow-hidden flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center text-center">
          <p className="text-5xl text-white font-black">Bring your fantastic pieces</p>
          <p className="text-5xl text-white font-black">to our Gachapon!</p>
        </div>
        <Button />
        <img src="landing-background2.png" alt="" className="-z-10 absolute w-full object-contain"/>
      </div>
      <div className="w-full flex flex-col items-center mt-8">
        <div className="flex justify-center items-center gap-24">
          <div className="w-[30%] flex flex-col gap-8">
            <div className="text-justify">
              <h1 className="text-3xl font-semibold">What&apos;s a Gachapon?</h1>
              <p className="text-xl mt-2">Gashapon (ガシャポン), also called gachapon (ガチャポン), is a trademark of Bandai. Among the variety of vending machine-dispensed capsule toys that originated in the 1960s, it became popular in Japan and elsewhere.</p>
            </div>
            <div className="text-justify">
              <h1 className="text-3xl font-semibold">You can submit your art here!</h1>
              <p className="text-xl mt-2">Sign up right now!</p>
              <div className="w-full flex justify-center mt-2">
                {address ? 
                  <Link className='text-white bg-black text-lg p-2 font-bold rounded-xl flex justify-center items-center hover:bg-slate-700' href="/createToken">SUBMIT COLLECTION! 🎆</Link>  
                  : <button onClick={() => {router.push('/login')}} className="bg-black text-white font-bold rounded-lg cursor-pointer px-4 py-2">Sign in</button>
                }
              </div>
            </div>
          </div>
          <div className="w-[10%]">
            <img src="frame-preview.png" alt="" className="h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}