'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function Header() {
return (
<div className="p-3 bg-white flex items-center">
    <div className="w-1/2 justify-left">
        <h1 className="ml-[5vw] text-4xl text-[black] font-bold">EDPON</h1>
    </div>
    <div className="w-1/2 text-[black] ml-[30vw] text-3xl">
    </div>
    <div className="w-1/2 justify-right">
    <ConnectButton label='Sign In' />
    </div>
</div>
)
}