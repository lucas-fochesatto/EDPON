'use client'

import { zoraCreator1155ImplABI } from "@zoralabs/protocol-deployments";

import { useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useRouter } from 'next/navigation';
import { Upload } from "lucide-react";
import './style.css';
import { makeContractMetadata, makeImageTokenMetadata } from "@/lib/metadata";
import createTokenAndCollection from "@/lib/createTokenAndCollection";
import Loading from "@/components/Loading";
import firstMint from "@/lib/firstMint";
import { parseEther } from "viem";
import Fetching from "@/components/Fetching";
import fetchTokensFromCollectionArray from "@/lib/fetchTokensFromCollectionArray";
import Token from "@/components/Token";
import Collection from "@/components/Collection";
import AddCollectionButton from "@/components/AddCollectionButton";
import CreateTokenButton from "@/components/CreateTokenButton";
import CreateCollectionButton from "@/components/CreateCollectionButton";

export type ArtCollectionType = {
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

type TokenType = {
    tokens: {
        tokenURI: any,
        quantity: bigint
    }[]
}

function formatBytes(a: number,b=2){if(!+a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return`${parseFloat((a/Math.pow(1024,d)).toFixed(c))} ${["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}`}

export default function CreateToken() {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const router = useRouter();
    const { address } = useAccount();
    const chainId = useChainId();
    const publicClient = usePublicClient();
    const { writeContract, data: hash } = useWriteContract();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [collections, setCollections]  = useState<ArtCollectionType[]>([]);
    const [tokens, setTokens] = useState<TokenType[]>([]);
    const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(0);
    const [already, setAlready] = useState<number>(0);
    const [file, setFile] = useState<File>();
    const [artFile, setArtFile] = useState<File>();
    const [imagePreview, setImagePreview] = useState<any>();
    const [artImagePreview, setArtImagePreview] = useState<any>();
    const [tokenName, setTokenName] = useState("");
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(true);
    const [loadingTokens, setLoadingTokens] = useState(true);
    const [loadingCreateToken, setLoadingCreateToken] = useState(false);
    const [createTokenMessage, setCreateTokenMessage] = useState('');
    const [createCollectionMessage, setCreateCollectionMessage] = useState('');
    
    const [alreadyForm, setAlreadyForm] = useState({
        address: "",
    })

    const [notAlreadyForm, setNotAlreadyForm] = useState({
        collectionName: "",
        description: ""
    })

    useEffect(() => {
        if(isConfirmed) {
            alert("Operation successful")
            window.location.reload()
        }
    }, [isConfirmed])
    
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

    // retrieve tokens from all collections
    useEffect(() => {
        if(collections.length == 0) return

        fetchTokensFromCollectionArray({collections, chainId, publicClient})
            .then(tokens => {console.log(tokens); setTokens(tokens)})
            .then(() => setLoadingTokens(false))
    }, [collections])

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

        if(loadingAdd) return

        setLoadingAdd(true)

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
            alert("Collection added successfully!")
            setLoadingAdd(false)
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
        setCreateCollectionMessage("Making metadata")
        
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

        setCreateCollectionMessage("Fetching to EDPON")
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
        setCreateTokenMessage("Making metadata...")

        // retrieve collection info
        const collection = collections[selectedCollectionIndex]

        const tokenMetadataJsonUri = await makeImageTokenMetadata({
            imageFile: artFile,
            tokenName 
        })

        const mintReferral = process.env.NEXT_PUBLIC_MINT_REFERRAL as `0x${string}`

        setCreateTokenMessage("Please sign message")
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
        
        setCreateTokenMessage("Fetching to EDPON...")
        // patch collection to add field collectionAddress
        await fetch(`${apiUrl}/patch-art-collection/${collection.artCollectionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ artCollectionAddress: collectionAddress })
        })

        setCreateTokenMessage("Please mint it")
        const parameters = await firstMint({ address: address!, mintReferral, collectionAddress, chainId, publicClient });
                
        writeContract(parameters)
    }

    return (
        <div className="p-8 flex flex-col items-center h-[calc(100vh-64px-72px)] background">
            <div className="flex flex-col gap-8"> 
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Gachart</h1>
                    <p className="text-base text-black">To submit an art, choose a collection or create a brand new one</p>
                </div>

                <div className="flex w-[70vw] h-[65vh] justify-between">
                    {
                        loadingCollections ? <Fetching width="w-[50%]"/> :
                        <div className="w-[50%] border border-stone-900 rounded-md bg-white p-4">
                            <h1 className="text-xl font-bold mb-4">Your collections on EDPON</h1>
                            <div className="h-[calc(50%-28px-1rem)] overflow-y-auto">
                                <div className="grid grid-cols-4 gap-[5px]">
                                    {collections.map((collection, index) => (        
                                        <Collection collection={collection} index={index} isSelected={selectedCollectionIndex == index} setSelectedCollectionIndex={setSelectedCollectionIndex} key={index}/>
                                    ))}
                                    <AddCollectionButton index={collections.length} isSelected={selectedCollectionIndex == collections.length} setSelectedCollectionIndex={setSelectedCollectionIndex}/>
                                </div>
                            </div>
                            { selectedCollectionIndex != collections.length && <h1 className="text-xl font-bold mb-4">Tokens on this collection</h1> }
                            { loadingTokens ? <Fetching width="w-[100%]" border=""/>  :
                                <>
                                {
                                    selectedCollectionIndex != collections.length &&
                                    <div className="h-[calc(50%-28px-1rem)] overflow-y-auto">
                                        <div className=" grid grid-cols-4 gap-[5px]">
                                            { tokens[selectedCollectionIndex].tokens.map((token, index) => 
                                                <Token key={index} token={token} collection={collections[selectedCollectionIndex]} />
                                            ) }
                                        </div>
                                    </div>
                                }
                                </>
                            }
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
                                            <button onClick={handleAddCollection} className="mt-2 bg-black text-white font-bold rounded-md cursor-pointer px-4 py-2">
                                                { loadingAdd ? <Loading color="white" /> : "Add collection" }
                                            </button>
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
                                            
                                            <CreateCollectionButton handleCreateCollection={handleCreateCollection} isLoading={loadingCreate} message={createCollectionMessage} />
                                        </div>
                                    }
                                </div>
                            </>
                            :
                            <>
                                <h1 className="text-xl font-bold mb-4">Setup a new art</h1>
                                <div className="w-full flex flex-col items-center bg-white p-4 border border-stone-900 rounded-md ">
                                    <label htmlFor="art-upload" className="w-[60%] aspect-square border border-stone-900 rounded-md cursor-pointer">
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
                                        <CreateTokenButton handleCreateToken={handleCreateToken} isLoading={loadingCreateToken} message={createTokenMessage}/>
                                    </div>
                                </div>
                            </>
                        }
                        </div>
                    }
                </div> 
            </div>
        </div> 
    )
}