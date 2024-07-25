'use client'

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Header from './components/Header'
import Button from "./components/Button";
import Popup from "@/components/Popup";

/* 
  tasks para essa página:
  1. verificar se o creator já possui conta na nossa plataforma
  2. se não possuir, abrir um formulário de criação
*/

export default function Home() {
  const { address } = useAccount();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col pt-10 gap-2 ml-[5.8vw]">
        <div className="flex">
          <h1 className="text-3xl font-semibold">Sign In</h1> <h1 className="text-3xl ml-1.5">and</h1> 
          <h1 className="text-3xl font-semibold ml-1.5">submit</h1> 
          <h1 className="text-3xl ml-1.5">your fantastic pieces to our Gachapon!</h1>
          {address && (
              <Link className='ml-10 text-white bg-black text-3xl p-3 font-bold w-[27vw] rounded-xl justify-center items-center hover:bg-[blue]' href="/createToken">SUBMIT COLLECTION! 🎆</Link>  
            )
          }
        </div>
        <div className="flex flex-row mt-5">
          <div className="w-1/2">
          <h1 className="text-3xl font-semibold">What's a Gachapon?</h1>
          <p className="text-xl mt-2">Gashapon (ガシャポン), also called gachapon (ガチャポン), is a trademark of Bandai. Among the variety of vending machine-dispensed capsule toys that originated in the 1960s, it became popular in Japan and elsewhere.</p>
          <h1 className="text-2xl font-semibold mt-5">Try it on Warpcast</h1>
          <Button />
          </div>
          <div className="w-1/2 items-center justify-center">
          <img src="/gachamachine.gif" width='70%'/>
          </div>
        </div>
      </div>
      {/*
      <div className="h-[100vh] flex flex-col items-center justify-center gap-8">
        <h1 className="text-3xl font-bold">Make your NFTs popular by frames</h1>
        <p className="text-xl">First, login into our service</p>
        <ConnectButton label="Login" accountStatus={"address"} chainStatus={"none"} />
      </div>
      */}
    </>
  )
}