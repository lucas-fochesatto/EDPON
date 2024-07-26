'use client'

import { zoraCreator1155ImplABI } from "@zoralabs/protocol-deployments"

import { useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { useRouter } from 'next/navigation'
import { Circle, CircleCheck, PlusIcon, Upload } from "lucide-react";
import Header from '../components/Header';
import './style.css'
import { makeContractMetadata, makeImageTokenMetadata } from "@/lib/metadata";
import createTokenAndCollection from "@/lib/createTokenAndCollection";
import Loading from "@/components/Loading";
import firstMint from "@/lib/firstMint";
import { parseEther } from "viem";
import Fetching from "@/components/Fetching";

type ArtCollectionType = {
    artCollectionId: string,
    artCollectionAddress: `0x${string}`,
    collectionURI: string,
    creatorId: string,
    creatorName: string,
    collectionName: string,
    collectionCoverUrl: string,
    description: string,
    createdAt: string,
    price: any, // idk why it's true on data
    isFree: boolean,
    createdByEDPON: boolean
}

function formatBytes(a: number,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

export default function CreateToken() {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const router = useRouter();
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { writeContract } = useWriteContract();

    const [collections, setCollections]  = useState<ArtCollectionType[]>([]);
    const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0);
    const [already, setAlready] = useState<number>(0);
    const [file, setFile] = useState<File>();
    const [artFile, setArtFile] = useState<File>();
    const [imagePreview, setImagePreview] = useState<any>();
    const [artImagePreview, setArtImagePreview] = useState<any>();
    const [tokenName, setTokenName] = useState("");
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(true);
    const [loadingCreateToken, setLoadingCreateToken] = useState(false);
    
    const [alreadyForm, setAlreadyForm] = useState({
        address: "",
    })

    const [notAlreadyForm, setNotAlreadyForm] = useState({
        collectionName: "",
        description: ""
    })
    
    // retrieve all collections from user
    useEffect(() => {
        if(!address) return
        fetch(`${apiUrl}/get-creator/${address}`)
            .then(res => res.json())
            .then(data => (data.creatorId))
            .then(creatorId => fetch(`${apiUrl}/get-creator-collections/${creatorId}`))
            .then(res => res.json())
            .then((data : ArtCollectionType[]) => {
                if(data.length == 0) {
                    setLoadingCollections(false)
                    return
                }
                setCollections(data)
                setLoadingCollections(false)
                console.log(data)
            })
    }, [address])

    // hook that reads the owner from the contract address provided on alreadyForm
    const { data: collectionOwnerAddress } = useReadContract({
        abi: zoraCreator1155ImplABI,
        address: alreadyForm.address as `0x${string}`,
        functionName: "owner",
    })

    const { data: collectionURI } = useReadContract({
        abi: zoraCreator1155ImplABI,
        address: alreadyForm.address as `0x${string}`,
        functionName: "contractURI",
    })

    const balance = useBalance({
        address,
    })

    // handle option change
    const handleSelectedCollection = (e : any) => {
        setSelectedCollectionIndex(e.target.value)
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

    const handleCoverChange = (e: any) => {
        const file : File = e.target.files[0];

        // generate imagePreview
        if (file) {
          if(file.size > 5 * 1048576) {
            alert("Big file!")
            return
          }
          setFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        }
    };

    const handleArtChange = (e: any) => {
        const artFile : File = e.target.files[0];

        // generate imagePreview
        if (artFile) {
          if(artFile.size > 5 * 1048576) {
            alert("Big file!")
            return
          }
          setArtFile(artFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setArtImagePreview(reader.result);
          };
          reader.readAsDataURL(artFile);
        }
    }

    const handleAddCollection = async () => {
        // verify if user is logged in
        if(!address) {
            router.push('/login')
        }

        // verify if user owns the contract
        if(collectionOwnerAddress !== address) {
            alert("You don't own this contract")
            return;
        }

        // retrieve colllection info
        const response = await fetch('https://ipfs.decentralized-content.com/ipfs/' + collectionURI?.split('/')[2])
        const data = await response.json();
        const collectionName  = data.name;
        const description = data.description || '';
        const collectionCoverUrl = data.image;

        const creatorId = localStorage.getItem('userId');

        // fetch to backend
        const fetchData = {
            artCollectionAddress: alreadyForm.address,
            collectionURI,
            creatorId,
            creatorName: '',
            collectionName,
            collectionCoverUrl,
            description,
            price: 0,
            isFree: true,
            createdByEDPON: false
        }
        
        const res = await fetch(`${apiUrl}/create-art-collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchData)
        })

        if(res.ok) {
            window.location.reload()
        }
    }

    const handleCreateCollection = async () => {
        if(loadingCreate) return

        if(!notAlreadyForm.collectionName) {
            alert("Please fill in collection name")
            return
        }

        if(!file) {
            alert("Please choose a collection cover")
            return
        }

        setLoadingCreate(true)
        const { contractMetadataJsonUri, imageFileIpfsUrl } = await makeContractMetadata({
            imageFile: file,
            name: notAlreadyForm.collectionName,
            description: notAlreadyForm.description
        })

        const creatorId = localStorage.getItem('userId')

        // fetch collection to backend
        const fetchData = {
            artCollectionAddress: '',
            collectionURI: contractMetadataJsonUri,
            creatorId,
            creatorName: '',
            collectionName:  notAlreadyForm.collectionName,
            collectionCoverUrl: imageFileIpfsUrl,
            description: notAlreadyForm.description,
            price: 0,
            isFree: true,
            createdByEDPON: true
        }

        const res = await fetch(`${apiUrl}/create-art-collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchData)
        })

        if(res.ok) {
            alert("Collection created successfully on EDPON. You'll need to setup a token to see the collection on-chain")
            window.location.reload()
        }
    }

    const handleCreateToken = async () => {
        if(!tokenName) {
            alert("Please fill in token name")
            return
        }

        if(!artFile) {
            alert("Please choose an image")
            return
        }

        if(!balance.isSuccess) return

        if(balance.data.value < parseEther("0.000777")) {
            alert("You need at least 0.000777 ETH. You will receive 0.000444 ETH back at zora.co")
            return
        }

        if(loadingCreateToken) return

        setLoadingCreateToken(true)

        // retrieve collection info
        const collection = collections[selectedCollectionIndex]

        const tokenMetadataJsonUri = await makeImageTokenMetadata({
            imageFile: artFile,
            tokenName 
        })

        const mintReferral = process.env.NEXT_PUBLIC_MINT_REFERRAL as `0x${string}`

        const { collectionAddress } = await createTokenAndCollection({
            chainId,
            publicClient,
            address: address!,
            contract: {
                contractAdmin: address!,
                contractName: collection?.collectionName!,
                contractURI: collection?.collectionURI!
            },
            token: {
                payoutRecipient: address!,
                createReferral: mintReferral,
                tokenURI: tokenMetadataJsonUri
            }
        })

        // patch collection to add field collectionAddress
        await fetch(`${apiUrl}/patch-art-collection/${collection.artCollectionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artCollectionAddress: collectionAddress })
        })

        const parameters = await firstMint({ address: address!, mintReferral, collectionAddress, chainId, publicClient });
        writeContract(parameters)

        setLoadingCreateToken(false)
    }

    return (
        <>
        <Header />
        <div className="p-8 flex flex-col items-center h-[calc(100vh-64px-72px)] background">
            <div className="flex flex-col gap-8"> 
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Gachart</h1>
                    <p className="text-base text-black">To submit an art, choose a collection or create a brand new one</p>
                </div>

                <div className="flex w-[70vw] h-[65vh] justify-between">
                    {
                        loadingCollections ? <Fetching width="w-[50%]"/> :
                        <div className={`w-[50%] border-2 border-stone-900 rounded-md bg-white p-4`}>
                            <h1 className="text-xl font-bold mb-4">Your collections on EDPON</h1>
                            <div className="bg-gray-100 border border-stone-900 rounded-md">
                                {collections.map((collection, index) => (
                                    <div key={index} className={`flex items-center px-4 py-2 gap-4 cursor-pointer border-b border-stone-900 w-full`} onClick={() => setSelectedCollectionIndex(index)}>
                                        <input type="radio" id={`collection-${index}`} name="collection" value={index} onChange={handleSelectedCollection} checked={selectedCollectionIndex === index} hidden />
                                        <label htmlFor={`collection-${index}`} className="w-full flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <img 
                                                    src = {
                                                        collection.createdByEDPON ?
                                                        `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${collection.collectionCoverUrl.split('/')[2]}` 
                                                        :
                                                        `https://ipfs.decentralized-content.com/ipfs/${collection.collectionCoverUrl.split('/')[2]}`
                                                    }
                                                    alt="collection cover" className="w-[20px] h-[20px] object-cover rounded-md"
                                                />
                                                <h3 className="text-base">{collection.collectionName}</h3>
                                            </div>
                                            {
                                                selectedCollectionIndex === index ? 
                                                <CircleCheck size={16}/> : <Circle size={16}/>
                                            }
                                        </label>
                                    </div> 
                                ))}
                                <div className={`flex items-center px-4 py-2 gap-4 cursor-pointer w-full`} onClick={() => setSelectedCollectionIndex(collections.length)}>
                                    <input type="radio" id="create-new-collection" name="collection" value={collections.length} onChange={handleSelectedCollection} checked={selectedCollectionIndex === collections.length} hidden />
                                    <label htmlFor="create-new-collection" className="w-full flex items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <PlusIcon size={20} />
                                                <h3 className="text-base">Add new collection</h3>
                                            </div>
                                            {
                                                selectedCollectionIndex === collections.length ? 
                                                <CircleCheck size={16}/> : <Circle size={16}/>
                                            }
                                    </label>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        loadingCollections ? <Fetching width="w-[40%]"/> : 
                        <div className="w-[40%] border border-stone-900 rounded-md bg-[rgb(238,238,238)] p-4"> 
                        { selectedCollectionIndex === collections.length ?
                            <>
                                <h1 className="text-xl font-bold mb-4">Add collection</h1>
    
                                <div className="flex flex-col items-center bg-white p-4 border border-stone-900 rounded-md">
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
                                                <input type="text" name="address" value={alreadyForm.address} placeholder="0x1230sdfj2358gdk" onChange={handleAlreadyFormChange} className="w-full bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                            </div> 
                                            <button onClick={handleAddCollection} className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2">Add collection</button>
                                        </div>
                                        :
                                        <div className="w-full flex flex-col items-center gap-2 mt-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <h2 className="text-xs">Collection name</h2>
                                                <input type="text" name="collectionName" value={notAlreadyForm.collectionName} placeholder="Enter a cool name" onChange={handleNotAlreadyFormChange} className="w-full bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                            </div> 
                                            <div className="flex flex-col gap-1 w-full">
                                                <h2 className="text-xs">Description</h2>
                                                <textarea name="description" value={notAlreadyForm.description} placeholder="Enter description" onChange={handleNotAlreadyFormChange} className="w-full bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <h2 className="text-xs">Collection cover</h2>
                                                <label htmlFor="file-upload" className="cursor-pointer py-4 px-4 flex items-center gap-4 bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full">
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
                                                <input type="file" accept=".png, .jpg, .jpeg, .gif" id="file-upload" onChange={handleCoverChange} hidden />
                                            </div>
                                            
                                            <button onClick={handleCreateCollection} className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2">
                                                { loadingCreate ? <Loading color="white" /> : "Create collection" }
                                            </button>
                                        </div>
                                    }
                                </div>
                            </>
                            :
                            <>
                                <h1 className="text-xl font-bold mb-4">Setup a new art</h1>
                                <div className="w-full flex flex-col items-center bg-white p-4 border border-stone-900 rounded-md ">
                                    <label htmlFor="art-upload" className="w-[80%] aspect-square border-2 border-stone-900 rounded-md cursor-pointer">
                                        <div className="flex flex-col gap-4 items-center justify-center h-full">
                                            { artImagePreview ? 
                                                <img src={artImagePreview} alt="image" className="aspect-square object-cover w-full h-full"/>
                                                :
                                                <>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold">Select a file</p>
                                                    <p className="text-xs">PNG, JPEG and GIF supported. Max size 5MB.</p>
                                                </div>
                                                <Upload size={32} />
                                                </>
                                            }
                                            
                                        </div>
                                    </label>
                                    <input type="file" accept=".png, .jpg, .jpeg, .gif" id="art-upload" onChange={handleArtChange} hidden />
    
                                    <div className="w-full flex flex-col items-center gap-2 mt-4">
                                        <div className="flex flex-col gap-1 w-full">
                                            <h2 className="text-xs">Token name</h2>
                                            <input type="text" name="tokenName" value={tokenName} placeholder="Nice name here" onChange={(e) => setTokenName(e.target.value)} className="w-full bg-gray-100 text-base px-2 py-1 border border-stone-900 rounded-md w-full"/>
                                        </div> 
                                        <button onClick={handleCreateToken} className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2">
                                            { loadingCreateToken ? <Loading color="white" /> : "Submit" }
                                        </button>
                                    </div>
                                </div>
                            </>
                        }
                        </div>
                    }
                </div> 
            </div>
        </div>
        </>
    )
}