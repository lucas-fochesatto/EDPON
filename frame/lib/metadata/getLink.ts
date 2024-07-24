import getArweaveLink from './getArweaveLink';
import getIpfsLink from './getIpfsLink';

const getLink = (hash: string) => {
	if (!hash) return hash;
	if (hash.includes('ipfs://')) {
		return getIpfsLink(hash);
	}
	return getArweaveLink(hash);
};

export default getLink;
