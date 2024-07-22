class ArtCollection {
    constructor( ArtCollectionId, creatorId, creatorName, collectionCoverUrl, description, likes, comments, createdAt, price, isFree) {
        (this.ArtCollectionId = ArtCollectionId),
        (this.creatorId = creatorId),
        (this.creatorName = creatorName),
        (this.collectionCoverUrl = collectionCoverUrl),
        (this.description = description),
        (this.price = price);
        (this.isFree = isFree);
    }
}

export default ArtCollection;
