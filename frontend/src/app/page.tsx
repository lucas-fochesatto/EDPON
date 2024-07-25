'use client'

import { useAccount } from "wagmi";
import Link from "next/link";
import Header from './components/Header'
import Button from "./components/Button";

/* 
  tasks para essa página:
  1. verificar se o creator já possui conta na nossa plataforma
  2. se não possuir, abrir um formulário de criação
*/

export default function Home() {
  const { address } = useAccount();

  return (
    <>
      <Header />
      <div className="flex items-center py-4 px-12 w-full gap-2">
        <div className="flex flex-row justify-between mt-5">
          <div className="w-1/2">
            <p className="text-3xl"><strong>Sign in</strong> and <strong>submit</strong> your fantastic pieces to our Gachapon! </p>
            <div className="mt-4">
              <h1 className="text-3xl font-semibold">What's a Gachapon?</h1>
              <p className="text-xl mt-2">Gashapon (ガシャポン), also called gachapon (ガチャポン), is a trademark of Bandai. Among the variety of vending machine-dispensed capsule toys that originated in the 1960s, it became popular in Japan and elsewhere.</p>
              <h1 className="text-2xl font-semibold mt-5">Try it on Warpcast</h1>
              <Button />
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {address && (
                <Link className='text-white bg-black text-3xl p-3 font-bold w-full rounded-xl flex justify-center items-center hover:bg-[blue]' href="/createToken">SUBMIT COLLECTION! 🎆</Link>  
              )
            }
            <div className="w-full">
              <img src="/gachamachine.gif" className="w-full"/>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}