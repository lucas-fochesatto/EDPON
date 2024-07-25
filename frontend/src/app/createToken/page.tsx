'use client'

import { zoraCreator1155ImplABI } from "@zoralabs/protocol-deployments"

import { useEffect, useState } from "react";
import { useAccount, useChainId, usePublicClient, useReadContract } from "wagmi";
import { useRouter } from 'next/navigation'
import { Circle, CircleCheck, PlusIcon, Upload } from "lucide-react";
import fetchTokens from "@/lib/fetchTokens";

import './style.css'

type ArtCollectionType = {
    ArtCollectionAddress: `0x${string}`,
    ArtCollectionId: string,
    collectionCoverUrl: string,
    collectionName: string,
    creatorId: string,
    creatorName: string,
    description: string,
    price: any // idk why it's true on data
}

function formatBytes(a: number,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

/* 
    tasks que ainda faltam:
    1. upload da collection cover
    2. fetch no backend ao clicar em add collection
    3. usar as funções da rede da zora para setar um contrato novo
    4. formulario para criar um token se selecionar uma colecao previamente criada
    5. upload das imagens das artes
    6. fetch no backend (talvez nao precisa) para adicionar as artes
    7. criar o tokenMetadata através dos dados fornecidos no formulário
    8. usar as funções da rede da zora para criar os tokens
    
    Brasil :)
*/

export default function createToken() {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const chainId = useChainId();
    const publicClient = usePublicClient();

    const router = useRouter()
    const {address: realAddress} = useAccount();
    const address = "0x1230sdfj2358gdk"

    const [collections, setCollections]  = useState<ArtCollectionType[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('create-new');
    const [tokens, setTokens] = useState<any[]>([]);
    const [already, setAlready] = useState<number>(0);
    const [file, setFile] = useState<File>();
    const [imagePreview, setImagePreview] = useState<any>();
    
    const [alreadyForm, setAlreadyForm] = useState({
        address: "",
        description: ""
    })

    const [notAlreadyForm, setNotAlreadyForm] = useState({
        collectionName: "",
        description: ""
    })
    
    // retrieve all collections from user
    useEffect(() => {
        // if(!realAddress) router.push('/');
        if(localStorage.getItem('collections')) {
            setCollections(JSON.parse(localStorage.getItem('collections') || '[]'))
            setSelectedCollection(JSON.parse(localStorage.getItem('collections') as string)[0].collectionName)
            console.log("got it from ls")
            return;
        }
        fetch(`${apiUrl}/get-creator/${address}`)
            .then(res => res.json())
            .then(data => (data.creatorId))
            .then(creatorId => fetch(`${apiUrl}/get-creator-collections/${creatorId}`))
            .then(res => res.json())
            .then((data : ArtCollectionType[]) => {
                localStorage.setItem('collections', JSON.stringify(data))
                setSelectedCollection(data[0].collectionName)
                setCollections(data)
                
                console.log("got it api")
            })
    }, [])

    // fetch tokens from all collections
    useEffect(() => {
        if(!collections.length) return;

        let tokens: any[] = []
        collections.map(async (collection) => {
            const collectionAddress = collection.ArtCollectionAddress;

            const collectionTokens = await fetchTokens({chainId, collectionAddress, publicClient})

            tokens = [...tokens, ...collectionTokens.tokens]
        })
    }, [collections])

    // hook that reads the owner from the contract address provided on alreadyForm
    const { data: collectionOwnerAddress } = useReadContract({
        abi: zoraCreator1155ImplABI,
        address: alreadyForm.address as `0x${string}`,
        functionName: "owner",
    })

    // handle option change
    const handleSelectedCollection = (e : any) => {
        setSelectedCollection(e.target.value)
    }

    const handleAlreadyFormChange = (e : any) => {
        const { name, value } = e.target

        setAlreadyForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }))
    }

    const handleNotAlreadyFormChange = (e : any) => {
        const { name, value } = e.target

        setNotAlreadyForm((prevForm) => ({
            ...prevForm,
            [name]: value
        }))
    }

    const handleImageChange = (e: any) => {
        const file : File = e.target.files[0];

        // generate imagePreview
        if (file) {
          setFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
    };

    const handleAddCollection = async () => {
        // verify if user owns the contract
        console.log(collectionOwnerAddress)
        if(collectionOwnerAddress !== realAddress) {
            alert("You don't own this contract")
            return;
        }

        // fetch to backend
        
    }

    return (
        <div className="p-8 flex flex-col items-center h-[100vh] background">
            <div className="flex flex-col gap-8"> 
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Let's get your arts to the sky!</h1>
                    <p className="text-base text-gray-300">To submit an art, choose a collection or create a brand new one</p>
                </div>

                <div className="flex w-[70vw] h-[65vh] justify-between">
                    <div className="w-[50%] border-2 border-stone-900 rounded-md bg-black p-4">
                        <h1 className="text-xl font-bold mb-4">Your collections on Zora</h1>
                        <div className="bg-stone-950 border border-stone-900 rounded-md">
                            {collections.map((collection, index) => (
                                <div key={index} className={`flex items-center px-4 py-2 gap-4 cursor-pointer border-b border-stone-900 w-full`} onClick={() => setSelectedCollection(collection.collectionName)}>
                                    <input type="radio" id={`collection-${index}`} name="collection" value={collection.collectionName} onChange={handleSelectedCollection} checked={selectedCollection === collection.collectionName} hidden />
                                    <label htmlFor={`collection-${index}`} className="w-full flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <img src={collection.collectionCoverUrl} alt="collection cover" className="w-[20px] h-[20px] object-cover rounded-md"/>
                                            <h3 className="text-base">{collection.collectionName}</h3>
                                        </div>
                                        {
                                            selectedCollection === collection.collectionName ? 
                                            <CircleCheck size={16}/> : <Circle size={16}/>
                                        }
                                    </label>
                                </div> 
                            ))}
                            <div className={`flex items-center px-4 py-2 gap-4 cursor-pointer w-full`} onClick={() => setSelectedCollection('create-new')}>
                                <input type="radio" id="create-new-collection" name="collection" value="create-new" onChange={handleSelectedCollection} checked={selectedCollection === 'create-new'} hidden />
                                <label htmlFor="create-new-collection" className="w-full flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <PlusIcon size={20} />
                                            <h3 className="text-base">Add new collection</h3>
                                        </div>
                                        {
                                            selectedCollection === 'create-new' ? 
                                            <CircleCheck size={16}/> : <Circle size={16}/>
                                        }
                                </label>
                            </div>
                        </div>
                    </div>
                    { selectedCollection == 'create-new' ?
                        <div className="w-[40%] border border-stone-900 rounded-md bg-neutral-950 p-4">
                            <h1 className="text-xl font-bold mb-4">Add collection</h1>

                            <div className="flex flex-col items-center bg-[rgb(5,5,5)] p-4 border border-stone-900 rounded-md">
                                <h2 className="text-base">Is your collection already on zora network?</h2>

                                <div className="flex w-full justify-center items-center gap-10">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="no">No</label>
                                        <input type="radio" id="no" name="already" value={0} onChange={() => setAlready(0)} checked={already == 0} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="yes">Yes</label>
                                        <input type="radio" id="yes" name="already" value={1} onChange={() => setAlready(1)} checked={already == 1} />
                                    </div>
                                </div>

                                { already == 1 ? 
                                    <div className="w-full flex flex-col items-center gap-2 mt-4">
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Collection address</h2>
                                            <input type="text" name="address" value={alreadyForm.address} placeholder="0x1230sdfj2358gdk" onChange={handleAlreadyFormChange} className="w-full bg-[rgb(5,5,5)] text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                        </div>
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Description</h2>
                                            <textarea name="description" value={alreadyForm.description} placeholder="Enter description" onChange={handleAlreadyFormChange} className="w-full bg-[rgb(5,5,5)] text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                        </div>
                                        <button onClick={handleAddCollection} className="mt-2 bg-neutral-950 rounded-md cursor-pointer px-4 py-2">Add collection</button>
                                    </div>
                                    :
                                    <div className="w-full flex flex-col items-center gap-2 mt-4">
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Collection name</h2>
                                            <input type="text" name="collectionName" value={notAlreadyForm.collectionName} placeholder="Enter a nice name" onChange={handleNotAlreadyFormChange} className="w-full bg-[rgb(5,5,5)] text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                        </div> 
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Description</h2>
                                            <textarea name="description" value={notAlreadyForm.description} placeholder="Enter description" onChange={handleNotAlreadyFormChange} className="w-full bg-[rgb(5,5,5)] text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                        </div>
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Collection cover</h2>
                                            <label htmlFor="file-upload" className="cursor-pointer py-4 px-4 flex items-center gap-4 bg-[rgb(5,5,5)] text-base px-2 py-1 border border-stone-900 rounded-md w-full">
                                                { imagePreview ?
                                                <>
                                                <img src={imagePreview} alt="img" width={28} height={28}/>
                                                <div>
                                                    <p className="text-sm font-bold">{file?.name}</p>
                                                    <p className="text-xs">{formatBytes(file?.size!)}</p>
                                                </div>
                                                </> :
                                                <>
                                                <Upload size={28}/>
                                                <div>
                                                    <p className="text-sm font-bold">Select a file</p>
                                                    <p className="text-xs">PNG, JPEG and GIF supported. Max size 5MB.</p>
                                                </div>
                                                </>
                                                }
                                                
                                            </label>
                                            <input type="file" id="file-upload" onChange={handleImageChange} hidden />
                                        </div>
                                        <button onClick={handleAddCollection} className="mt-2 bg-neutral-950 rounded-md cursor-pointer px-4 py-2">Add collection</button>
                                    </div>
                                }
                            </div>


                        </div>
                        :
                        <div className="w-1/2"> 
                            <h1 className="text-lg m-4">Tokens on this collection</h1>
                            { 
                                tokens.filter(token => token.token.contract.address === collections.find(collection => collection.collectionName === selectedCollection)?.ArtCollectionAddress).map((token, index) => (
                                    <div key={index} className="flex items-center px-4 py-2 gap-4 hover:bg-gray-800 cursor-pointer border-b border-gray-300 w-full last:border-0">
                                        <img src={token.token.metadata?.image} alt="token image" className="w-8 h-8 object-cover rounded-md"/>
                                    </div>
                                ))
                            }
                        </div>
                    }
                </div> 

            </div>
        </div>
    )
}