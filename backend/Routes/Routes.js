import express from 'express';

import {
  createArtCollection,
  createCreator,
  getArtCollection,
  getArtCollections,
  getCreators,
  getCreatorByWallet,
  updateArtCollection,
  updateCreator,
  getAllRandom,
  patchArtCollection,
  getCreatorArtCollections,
  deleteArtCollection,
  deleteCreator,
} from '../Controllers/backControllers.js';

const router = express.Router();

router.get('/get-collections', getArtCollections);
router.get('/get-creators', getCreators);
router.get('/get-creator/:wallet', getCreatorByWallet);
router.post('/create-art-collection', createArtCollection);
router.post('/create-creator', createCreator);
router.get('/get-art-collection/:id', getArtCollection);
router.put('/update/:id', updateArtCollection);
router.put('/update-creator/:id', updateCreator);
router.get('/get-all-random', getAllRandom);
router.patch('/patch-art-collection/:id', patchArtCollection);
router.get('/get-creator-collections/:creatorId', getCreatorArtCollections);
router.delete('/delete-art-collection/:id', deleteArtCollection);
router.delete('/delete-creator/:creatorId', deleteCreator);

export default router;