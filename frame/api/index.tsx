import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
//import { neynar } from 'frog/hubs'
// import { handle } from 'frog/vercel' 
import { devtools } from 'frog/dev';
import { serve } from '@hono/node-server';
import { Box, Heading, Text, VStack, vars } from "../lib/ui.js"
// import { db, addDoc, collection, updateDoc, doc, getDoc, getDocs } from '../utils/firebaseConfig.js'

import { collectionsApp } from './collections.js'
// import { verificationsApp } from './verification.js'

const title = 'edpon';

export const app = new Frog({
  title,
  assetsPath: '/',
  basePath: '/api',
  // browserLocation: '/',
  ui: { vars },
  // Supply a Hub to enable frame verification.
  //hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

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

app.frame('/verify', (c) => {
  return c.res({
    title,
    image: (
      <Box
      grow
      alignHorizontal="center"
      backgroundColor="background"
      padding="32"
    >
      <VStack gap="4">
        <Heading>FrogUI 🐸</Heading>
        <Text color="text200" size="20">
          Build consistent frame experiences
        </Text>
      </VStack>
    </Box>
    ),
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>back</Button>,
      <Button action='/collections/0'>go collections</Button>,
      <Button action='/verifications'>verify</Button>,
      <Button.Reset>reset test</Button.Reset>,
    ],
  })
})

app.route('/collections', collectionsApp);
// app.route('/verifications', verificationsApp);

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });

// console.log(`Server started: ${new Date()} `);

// export const GET = handle(app)
// export const POST = handle(app)
