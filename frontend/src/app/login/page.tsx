'use client'

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Popup from "@/components/Popup";

export default function Login() {
  const { address } = useAccount();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    console.log(address)
    if (address) {
      openPopup();
    }
  }, [address])

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="h-[calc(100vh-64px-72px)] flex flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">We almost got your collection</h1>
        <p className="text-xl">You just have to login!</p>
      </div>

      <ConnectButton label="Login" accountStatus={"address"} chainStatus={"none"} />

      {isPopupOpen && <Popup onClose={closePopup} />}
      
    </div>
  )
}