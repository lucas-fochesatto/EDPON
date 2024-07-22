class ArtCollection {
    constructor( ArtCollectionId, creatorId, creatorName, collectionName, collectionCoverUrl, description, createdAt, price, isFree) {
        (this.ArtCollectionId = ArtCollectionId),
        (this.creatorId = creatorId),
        (this.creatorName = creatorName),
        (this.collectionName = collectionName),
        (this.collectionCoverUrl = collectionCoverUrl),
        (this.description = description),
        (this.price = price);
        (this.isFree = isFree);
    }
}

export default ArtCollection;
