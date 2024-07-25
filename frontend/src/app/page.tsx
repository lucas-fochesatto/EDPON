'use client'

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";

/* 
  tasks para essa página:
  1. verificar se o creator já possui conta na nossa plataforma
  2. se não possuir, abrir um formulário de criação
*/

export default function Home() {
  const { address } = useAccount();

  return (
    <div className="flex flex-col items-center pt-10 gap-8">
      <h1 className="text-3xl font-bold">Go to /mint to see the functions being called.</h1>
      <ConnectButton />

      {address && (
          <Link href="/createToken">Go to create token page</Link>  
        )
      }
    </div>
  )
}