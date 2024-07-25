const getIpfsLink = (hash: string) =>
	hash?.indexOf?.('ipfs://') > -1
		? hash.replace('ipfs://', 'https://ipfs.decentralized-content.com/ipfs/') // zora public ipfs gateway
		// ? hash.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
		// ? hash.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')
		: hash;

export default getIpfsLink;
