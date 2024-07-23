import dotenv from 'dotenv';

dotenv.config();

const fetchArtCollections = async () => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-collections`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Error getting art collections data");
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

const fetchCreators = async () => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-creators`);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Error getting creators data");
            return [];
        }
    } catch (error) {
        console.error(error);
        return [];
    }
};

const updateCreatorInfo = async (creatorId:any) => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-creator/` + creatorId);
        if (response.status == 200) {
            const data = await response.json();
            localStorage.setItem('creator', JSON.stringify(data));
            return 200;
        } else if (response.status == 404) {
            return 404;
        }
    } catch (err) {
        console.log(err);
        return 400;
    }
}

const getCreatorByWallet = async (wallet:any) => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-creator/` + wallet);
        if (response.status == 200) {
            console.log("Fetched creator");
            const data = await response.json();
            return data;
        } else if (response.status == 404) {
            return;
        }
    } catch (err) {
        console.log(err);
    }
}

const getRandomCreatorAndArtCollection = async () => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-all-random`);
        if (response.status == 200) {
            const data = await response.json();
            return data;
        } else if (response.status == 404) {
            return;
        }
    } catch (err) {
        console.log(err);
    }
}

const getCreatorArtCollections = async (creatorId:any) => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/get-creator-collections/` + creatorId);
        if (response.status == 200) {
            const data = await response.json();
            return data;
        } else if (response.status == 404) {
            return;
        }
    } catch (err) {
        console.log(err);
    }
}

const createArtCollection = async (creatorId:any, collectionName:any, collectionCoverUrl:any, description:any, price:any, isFree:any) => {
    try {
        const response = await fetch(`https://${process.env.BACKEND_URL}/create-art-collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ creatorId, collectionName, collectionCoverUrl, description, price, isFree })
        });

        if (response.ok) {
            console.log("Art collection created");
            return 200;
        }
    } catch (err) {
        console.log(err);
        return 400;
    }
}

export const dbapi = {
    fetchArtCollections,
    fetchCreators,
    updateCreatorInfo,
    getCreatorByWallet,
    getRandomCreatorAndArtCollection,
    getCreatorArtCollections,
    createArtCollection
}
