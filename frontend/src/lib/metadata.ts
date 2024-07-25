import { ContractMetadataJson, makeMediaTokenMetadata } from "@zoralabs/protocol-sdk";
import { pinFileWithPinata, pinJsonWithPinata } from "./pinata";
 
export async function makeContractMetadata({
  imageFile,
  name,
  description,
}: {
  imageFile: File;
  name: string;
  description?: string;
}) {
  // upload image to Pinata
  const imageFileIpfsUrl = await pinFileWithPinata(imageFile);
 
  // build contract metadata json
  const metadataJson: ContractMetadataJson = {
    description,
    image: imageFileIpfsUrl,
    name,
  };
 
  // upload token metadata json to Pinata and get ipfs uri
  const contractMetadataJsonUri = await pinJsonWithPinata(metadataJson);
 
  return { contractMetadataJsonUri, imageFileIpfsUrl };
}

export async function makeImageTokenMetadata({
  imageFile,
  tokenName
}: {
  imageFile: File,
  tokenName: string
}) {
  // upload image and thumbnail to Pinata
  const mediaFileIpfsUrl = await pinFileWithPinata(imageFile);
  console.log(mediaFileIpfsUrl)
 
  // build token metadata json from the text and thumbnail file
  // ipfs urls
  const metadataJson = await makeMediaTokenMetadata({
    mediaUrl: mediaFileIpfsUrl,
    name: tokenName
  });
  // upload token metadata json to Pinata and get ipfs uri
  const jsonMetadataUri = await pinJsonWithPinata(metadataJson);
 
  return jsonMetadataUri;
}