'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export default function Header() {
    const { address } = useAccount();
    const router = useRouter();

    return (
        <div className="w-full py-4 px-12 bg-white flex items-center justify-between">
            <a className="flex text-4xl text-[black] font-bold" href='/'>EDPON</a>
            { address ? 
                <ConnectButton />
                :
                <button onClick={() => {router.push('/login')}} className="bg-black text-white font-bold rounded-lg cursor-pointer px-4 py-2">Sign in</button>
            }
            
        </div>
    )
}