import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { handle } from 'frog/vercel'
import { devtools } from 'frog/dev';
import { serve } from '@hono/node-server';
import { getFarcasterUserInfo } from '../lib/neynar';
import { vars } from "../lib/ui.js"
// import { zora1155Implementation } from '../lib/abi/zora1155Implementation.js';
import { dbapi } from '../lib/dbapi.js';

// *****************************************************************************************************
// THIS IMPORT MAY BE USEFUL 
// import { Box, Heading, Text, VStack, vars } from "../lib/ui.js"
// import { parse } from 'postcss';
// import { db, addDoc, collection, updateDoc, doc, getDoc, getDocs } from '../utils/firebaseConfig.js'
// import { collectionsApp } from './collections.js'
// import { verificationsApp } from './verification.js'
//import { neynar } from 'frog/hubs'
// *****************************************************************************************************


const title = 'edpon';
// const CUSTOM_COLLECTIONS = '0xe88035cbc6703b18e2899fe2b5f6e435f00ade41';

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
      <Button action='/verify'>PLAY 🕹️</Button>,
    ],

  })
})

// verify Farcaster fid 
app.frame('/verify', async (c) => {
  if (c.frameData?.fid) {
    const { verifiedAddresses } = await getFarcasterUserInfo(c.frameData?.fid);
    if (!verifiedAddresses || verifiedAddresses.length === 0) {
      return c.res({
        headers: {
          'cache-control': 'max-age=0',
        },
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

  // console.log(collectionsInfo)

  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
    title,
    image: '/collectionPicker.png',
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/collections/0">Search Collection</Button>,
      <Button.Reset>RESET</Button.Reset>,
    ],
  });
});

app.frame('/collections/:id', async (c) => {
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
      <TextInput placeholder="Value (ETH)" />,
      <Button action={`/collections/${boundedIndex === 0 ? (collections.length - 1) : (boundedIndex - 1)}`}>⬅️</Button>,
      <Button action={`/collections/${(boundedIndex + 1) % collections.length}`}>➡️</Button>,
      // <Button.Transaction action='/loading' target="/mint">Pick! ✅</Button.Transaction>, 
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

// app.transaction('/mint', (c) => {
//   const { inputText } = c
//   // Send transaction response.
//   return c.contract({
//     zora1155Implementation,
//     chainId: 'eip155:11155111',
//     functionName: 'mintWithRewards',
//     args: [
//       minter,
//       tokenId, 
//       quantity,
//       minterArguments,
//       '0xC1bd4Aa0a9ca600FaF690ae4aB67F15805d8b3A1',
//       to: CUSTOM_COLLECTIONS,
//       value: parseEther('0.000777').toString,
//     ],
//   })
// })

app.frame('/loading', async (c) => {
  const name = 'test'
  return c.res({
    title,
    image: '/pokeball.gif',
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/result/${name}`}>next</Button>,
      <Button.Reset>reset test</Button.Reset>,
    ],
  })
})

app.frame('/result/:name', async (c) => {
  const name = c.req.param('name')
  return c.res({
    title,
    image: `/${name}.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button action={`/`}>Share</Button>,
      <Button.Reset>Play Again</Button.Reset>,
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
