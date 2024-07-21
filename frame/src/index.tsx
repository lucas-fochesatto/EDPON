import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
//import { neynar } from 'frog/hubs'
import { devtools } from 'frog/dev';
import { serve } from '@hono/node-server';

import { collectionsApp } from './collections.js'

// import { db, addDoc, collection, updateDoc, doc, getDoc, getDocs } from '../utils/firebaseConfig.js'

const title = 'edpon';

export const app = new Frog({
  title,
  assetsPath: '/',
  basePath: '/',
  // Supply a Hub to enable frame verification.
  //hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', (c) => {
  return c.res({
    title,
    image: '/gachamachine.gif',
    imageAspectRatio: '1:1',
    intents: [<Button action='/test'>PLAY 🕹️</Button>],
  })
})

app.frame('/test', (c) => {
  return c.res({
    title,
    image: '/pokeball.gif',
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>go back</Button>,
      <Button action='/collections'>go collections</Button>,
      <Button.Reset>reset test</Button.Reset>,
    ],
  })
})

app.route('/collections', collectionsApp);

if (process.env.NODE_ENV !== 'production') {
  devtools(app, { serveStatic });
}

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 5173 });

console.log(`Server started: ${new Date()} `);
