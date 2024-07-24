import getArweaveLink from './getArweaveLink.js';
import getIpfsLink from './getIpfsLink.js';

const getLink = (hash: string) => {
	if (!hash) return hash;
	if (hash.includes('ipfs://')) {
		return getIpfsLink(hash);
	}
	return getArweaveLink(hash);
};

export default getLink;
