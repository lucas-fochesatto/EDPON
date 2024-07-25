import firebase from "../firebase.js";
import ArtCollection from "../Models/ArtCollection.js";
import Creator from "../Models/Creator.js";
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

const db = getFirestore(firebase);

export const createArtCollection = async (req, res, next) => {
    try {
        const data = req.body;

        // Add server timestamp to the data
        data.createdAt = serverTimestamp();

        // Add the new art collection to the "artCollections" collection
        const docRef = await addDoc(collection(db, "artCollections"), data);

        // Retrieve the creator's document reference
        const creatorId = data.creatorId; // Assuming creatorId is present in the artCollection data
        const creatorRef = doc(db, "creators", creatorId);
        const creatorDoc = await getDoc(creatorRef);

        if (creatorDoc.exists()) {
            const creatorData = creatorDoc.data();

            // Assign artCollectionId and creatorName to the new art collection
            const artCollectionId = docRef.id;
            const creatorName = creatorData.name;

            console.log("creatorData", creatorData);
            await updateDoc(doc(db, "artCollections", artCollectionId), {
                artCollectionId,
                creatorName,
            });

            // Update the creator's artCollectionsId array
            const updatedArtCollectionsId = creatorData.artCollectionsId
                ? [...creatorData.artCollectionsId, artCollectionId]
                : [artCollectionId];

            // Update the creator document with the new artCollectionsId array
            await updateDoc(creatorRef, {
                artCollectionsId: updatedArtCollectionsId,
            });
        } else {
            throw new Error("Creator not found");
        }

        res.status(200).send("Art collection created successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const createCreator = async (req, res, next) => {
    try {
        const data = req.body;
        const docRef = await addDoc(collection(db, "creators"), data);

        // assing creatorId to the user
        const creatorId = docRef.id;
        await updateDoc(doc(db, "creators", creatorId), { creatorId });

        res.status(200).send(creatorId);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const getArtCollections = async (req, res, next) => {
    try {
        const artCollections = await getDocs(collection(db, "artCollections"));
        const artCollectionArray = [];

        if (artCollections.empty) {
            res.status(400).send("No Art Collections found");
        } else {
            artCollections.forEach((doc) => {
                const artCollection = new ArtCollection(
                    // doc.id,
                    doc.data().artCollectionId,
                    doc.data().artCollectionAddress,
                    doc.data().collectionURI,
                    doc.data().creatorId,
                    doc.data().creatorName,
                    doc.data().collectionName,
                    doc.data().collectionCoverUrl,
                    doc.data().description,
                    doc.data().createdAt,
                    doc.data().price,
                    doc.data().isFree
                );
                artCollectionArray.push(artCollection);
            });

            res.status(200).send(artCollectionArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const getCreators = async (req, res, next) => {
    try {
        const creators = await getDocs(collection(db, "creators"));
        const creatorsArray = [];

        if (creators.empty) {
            res.status(400).send("No creators found");
        } else {
            creators.forEach((doc) => {
                const user = new Creator(
                    // doc.id,
                    doc.data().creatorId,
                    doc.data().wallet,
                    doc.data().name,
                    doc.data().artCollectionsId
                );
                creatorsArray.push(user);
            });

            res.status(200).send(creatorsArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const getCreatorByWallet = async (req, res, next) => {
    try {
        const wallet = req.params.wallet;
        const creators = await getDocs(collection(db, "creators"));
        let creatorFound = false;
        let creatorObj = {};

        if (creators.empty) {
            res.status(400).send("No creators found");
        } else {
            creators.forEach((doc) => {
                if (doc.data().wallet === wallet) {
                    creatorFound = true;
                    creatorObj = new Creator(
                        doc.data().creatorId,
                        doc.data().wallet,
                        doc.data().name,
                        doc.data().artCollectionsId
                    );
                }
            });

            if (creatorFound) {
                res.status(200).send(creatorObj);
            } else {
                res.status(404).send("Creator not found");
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const getArtCollection = async (req, res, next) => {
    try {
        const id = req.params.id;
        const artCollection = doc(db, "artCollections", id);
        const data = await getDoc(artCollection);
        if (data.exists()) {
            res.status(200).send(data.data());
        } else {
            res.status(404).send("artCollection not found");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// super simple update function (not recommended for production)
export const updateCreator = async (req, res, next) => {
    try {
        const id = req.params.id;
        const senderId = req.user.id;
        const data = req.body;

        const creatorRef = doc(db, "creators", id);
        const creatorDoc = await getDoc(creatorRef);

        if (!creatorDoc.exists()) {
            return res.status(404).send("Creator not found");
        }

        if (senderId !== creatorDoc.id) {
            return res
                .status(403)
                .send("Unauthorized to update this creator's information");
        }

        await updateDoc(creatorRef, data);
        res.status(200).send("Creator updated successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// get random creator and random art collection from this creator
export const getAllRandom = async (req, res, next) => {
    try {
        const creatorsSnapshot = await getDocs(collection(db, "creators"));
        const creatorsArray = [];

        if (creatorsSnapshot.empty) {
            return res.status(400).send("No creators found");
        }

        creatorsSnapshot.forEach((doc) => {
            const creatorData = doc.data();
            creatorsArray.push({
                creatorId: creatorData.creatorId,
                wallet: creatorData.wallet,
                name: creatorData.name,
                artCollectionsId: creatorData.artCollectionsId,
            });
        });

        // Select a random creator from the array
        const randomCreatorIndex = Math.floor(
            Math.random() * creatorsArray.length
        );
        const randomCreator = creatorsArray[randomCreatorIndex];

        // Select a random artCollectionsId from the chosen creator
        const randomArtCollectionIndex = Math.floor(
            Math.random() * randomCreator.artCollectionsId.length
        );
        const randomArtCollectionId =
            randomCreator.artCollectionsId[randomArtCollectionIndex];

        // Create the response object
        const responseObject = {
            creator: randomCreator,
            randomArtCollectionId: randomArtCollectionId,
        };

        // Send the response
        res.status(200).send(responseObject);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const updateArtCollection = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const artCollection = doc(db, "artCollections", id);
        await updateDoc(artCollection, data);
        res.status(200).send("art Collection updated successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const patchArtCollection = async (req, res, next) => {
    try {
        const id = req.params.id;
        const dataToUpdate = req.body;

        const artCollectionRef = doc(db, "artCollections", id);
        const artCollectionSnap = await getDoc(artCollectionRef);

        if (artCollectionSnap.exists()) {
            // Merge existing data with the updated data
            const existingData = artCollectionSnap.data();
            const updatedData = { ...existingData, ...dataToUpdate };

            // Update the artCollection document with the updated data
            await updateDoc(artCollectionRef, updatedData);

            res.status(200).send(
                "Art Collection partially updated successfully"
            );
        } else {
            res.status(404).send("Art Collection not found");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const getCreatorArtCollections = async (req, res, next) => {
    try {
        const creatorId = req.params.creatorId;
        const artCollections = await getDocs(collection(db, "artCollections"));
        const artCollectionArray = [];

        if (artCollections.empty) {
            res.status(400).send("No Art Collections found");
        } else {
            artCollections.forEach((doc) => {
                if (doc.data().creatorId === creatorId) {
                    const artCollection = new ArtCollection(
                        doc.data().artCollectionId,
                        doc.data().artCollectionAddress,
                        doc.data().collectionURI,
                        doc.data().creatorId,
                        doc.data().creatorName,
                        doc.data().collectionName,
                        doc.data().collectionCoverUrl,
                        doc.data().description,
                        doc.data().createdAt,
                        doc.data().price,
                        doc.data().isFree
                    );
                    artCollectionArray.push(artCollection);
                }
            });

            res.status(200).send(artCollectionArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const deleteArtCollection = async (req, res, next) => {
    try {
        const id = req.params.id;
        await deleteDoc(doc(db, "artCollections", id));
        res.status(200).send("art Collection deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};

export const deleteCreator = async (req, res, next) => {
    try {
        const id = req.params.id;
        await deleteDoc(doc(db, "creators", id));
        res.status(200).send("Creator deleted successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
};
