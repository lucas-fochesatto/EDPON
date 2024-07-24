import { serveStatic } from '@hono/node-server/serve-static';
import { Button, Frog, parseEther } from 'frog';
import { handle } from 'frog/vercel';
import { encodeAbiParameters, Address } from 'viem';
import { devtools } from 'frog/dev';
import { serve } from '@hono/node-server';
import { getFarcasterUserInfo } from '../lib/neynar.js';
import { vars } from '../lib/ui.js';
import { zora1155Implementation } from '../lib/abi/zora1155Implementation.js';
import { dbapi } from '../lib/dbapi.js';
// import { zora } from 'viem/chains';
import { publicClient } from '../lib/contracts.js';
// import getUri from '../lib/contracts/getUri.js';
// import { Address } from 'viem';
import getUri from '../lib/zora/getUri.js';
import getLink from '../lib/metadata/getLink.js';

// *****************************************************************************************************
// THIS IMPORT MAY BE USEFUL 
// import { Box, Heading, Text, VStack, vars } from "../lib/ui.js"
// import { parse } from 'postcss';
// import { db, addDoc, collection, updateDoc, doc, getDoc, getDocs } from '../utils/firebaseConfig.js'
// import { collectionsApp } from './collections.js'
// import { verificationsApp } from './verification.js'
// *****************************************************************************************************

const title = 'edpon';
const CUSTOM_COLLECTIONS = '0x0DEA6B5c7372b3414611e70e15E474521E0fc686';
const minter = '0x04E2516A2c207E84a1839755675dfd8eF6302F0a';
const tokenId = '1'
const quantity = 1n;


export const app = new Frog({
  title,
  assetsPath: '/',
  basePath: '/api',
  // browserLocation: '/',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  //hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })

  initialState: {
    collections: [],
    verifiedAddresses: [],
  },
})

app.use('/*', serveStatic({ root: './public' }))

// Home frame
app.frame('/', (c) => {
  return c.res({
    title,
    image: '/gachamachine.gif',
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/verify/0'>PLAY 🕹️</Button>,
    ],

  })
})

// verify Farcaster fid 
app.frame('/verify/:id', async (c) => {
  if (c.frameData?.fid) {
    const { verifiedAddresses } = await getFarcasterUserInfo(c.frameData?.fid);
    if (!verifiedAddresses || verifiedAddresses.length === 0) {
      return c.res({
        title,
        image: '/insert-token.gif',
        imageAspectRatio: '1:1',
        intents: [
          <Button action="/">RETURN</Button>,
          <Button.Reset>RESET</Button.Reset>,
        ],
      });
    }
    c.deriveState((prevState: any) => {
      prevState.verifiedAddresses = verifiedAddresses;
    });
  }

  const collectionsInfo = await dbapi.fetchArtCollections() as any

  c.deriveState((prevState: any) => {
    prevState.collections = collectionsInfo as any;
  })

  const index = Number(c.req.param('id'));

  const collections =
    (c.previousState as any).collections && (c.previousState as any).collections.length > 0
      ? (c.previousState as any).collections
      : (await dbapi.fetchArtCollections());

  const boundedIndex = ((index % collections.length) + collections.length) % collections.length;

  const currentCollection = collections[boundedIndex];
  const collectionName = currentCollection.collectionName;
  const artistName = currentCollection.creatorName;

  return c.res({
    title: collectionName,
    image: (
      <div
        style={{
          color: '#81BAEC',
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          // backgroundImage: "url(https://i.imgur.com/IcfnuQ0.png)",
          fontSize: 60,
          backgroundSize: "cover",
          backgroundPosition: 'center',
          height: "100%",
          width: "100%",
          backgroundRepeat: 'no-repeat',
        }}
      >
        <p style={{
          margin: 0,
        }}>{collectionName}</p>
        <p style={{
          color: 'white',
          fontSize: 30,
          margin: 0,
        }}
        >{artistName}</p>
      </div>
    ),
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/verify/${boundedIndex === 0 ? (collections.length - 1) : (boundedIndex - 1)}`}>⬅️</Button>,
      <Button action={`/verify/${(boundedIndex + 1) % collections.length}`}>➡️</Button>,
      <Button.Transaction action={`/loading/${tokenId}/0`} target="/mint">Pick! ✅</Button.Transaction>, 
      <Button action='/test'>test img</Button>,
      // <Button.Reset>Reset</Button.Reset>,
    ],
  })
});


app.frame('/test', async (c) => {
  
  let imge = {
    src: `/test.png`, //test image
  },collection = "0x0DEA6B5c7372b3414611e70e15E474521E0fc686" as `0x${string}`;

  try {
    const uri = await getUri(collection, BigInt(1));
    const urlLink = getLink(uri);
    // console.log(urlLink);
    const response = await fetch(urlLink);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const { image: responseImage } = data;
    console.log(responseImage);
    const src = getLink(responseImage);
    console.log(src);
    imge = {
      src: `${src}`,
    };
  } catch (error) {
    console.log(error);

    imge = {
      src: `/errorImg.jpeg`
    };
  }

  return c.res({
    title,
    image: `${imge.src || '/test.png'}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>Back 🕹️</Button>,
    ],
  })
})

app.transaction('/mint', async (c) => {
  const verifiedAddresses=
  (c.previousState as any).verifiedAddresses && (c.previousState as any).verifiedAddresses.length > 0
    ? (c.previousState as any).verifiedAddresses
    : ( (c.previousState as any).verifiedAddresses  = await getFarcasterUserInfo(c.frameData?.fid));


    const minterArguments = encodeAbiParameters(
      [
        { name: 'mintTo', type: 'address' },
        { name: 'comment', type: 'string' },
      ],
      [verifiedAddresses[0], `Collected from Kismet Casa's Gachapon Frame`],
    );
   return c.contract({
     abi: zora1155Implementation,
    //  chainId: `eip155:${zora.id}`,
    chainId: 'eip155:11155111',
    functionName: 'mintWithRewards',
    args: [
      minter,
      BigInt(tokenId),
      quantity,
      minterArguments,
      '0xC1bd4Aa0a9ca600FaF690ae4aB67F15805d8b3A1',
    ],
    to: CUSTOM_COLLECTIONS,
    value: parseEther('0.000777'),
  })
})

app.frame('/loading/:tokenId/:txId/', async (c) => {
  const prevTxId = c.req.param('txId');
  const tokenId = c.req.param('tokenId');
  let transactionReceipt;
  console.log(c);
  if (c.transactionId === undefined && prevTxId === undefined) return c.error({ message: 'No txId' });
  if ( prevTxId !== '0' ) { 
  c.transactionId = prevTxId as Address;
  }
  try {
    transactionReceipt = await publicClient.getTransactionReceipt({
      hash: prevTxId as Address,
    });
    if (transactionReceipt && transactionReceipt.status == 'reverted') {
      return c.error({ message: 'Transaction failed' });
    }
  } catch (error) {
    console.log(error)
  }
  console.log(transactionReceipt?.status);
  if (transactionReceipt?.status === 'success') {
  return c.res ({
    title,
    image: `/test.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/success/${tokenId}`}>FUUUUCK</Button>,
      <Button.Reset>LOADING SCREEN</Button.Reset>,
    ],
  })
}
else {
  return c.res ({
    title,
    image: `/test.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/loading/${tokenId}/${c.transactionId}`}>Check result</Button>,
      <Button.Reset>LOADING SCREEN</Button.Reset>,
    ],
  })
}
})

app.frame('/success/:id', async (c) => {
  const tokenId = c.req.param('id');
  return c.res ({
    title,
    image: `/pokeball.gif`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/result/${tokenId}`}>See NFT</Button>,
      <Button.Reset>RESET</Button.Reset>,
    ],
  })


})

app.frame('/result/:id', async (c) => {
  const tokenId = c.req.param('id');
  let img;
  try {
    const uri = await getUri(CUSTOM_COLLECTIONS, BigInt(tokenId));
    console.log(uri);
    const uriLink = getLink(uri);
    console.log(uriLink);
    const response = await fetch(uriLink);
    console.log(response);
    const data = await response.json();
    console.log(data);
    const { image: responseImage } = data as any;
    console.log(responseImage);
    const src = getLink(responseImage);
    img = `${src}`; 
  } catch (error) {
    img = '/test.png'; //test image
    console.log(error);
  };


  return c.res({
    title,
    image: `${img}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>Play again</Button>,
    ],
  })
})

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });

console.log(`Server started: ${new Date()} `);

export const GET = handle(app)
export const POST = handle(app)
