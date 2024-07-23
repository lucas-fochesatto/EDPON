import { Button, Frog } from 'frog';
import { vars } from "../lib/ui.js";

const title = 'edpon collections';

const collectionNames = ['Milady', 'I need Coffee', 'Col3', 'Col4'];
const artistNames = ['Remilia', 'KWS', 'Art3', 'Art4'];
export const collectionsApp = new Frog({
  title,
  assetsPath: '/',
  basePath: '/',
  ui: { vars },
})

collectionsApp.frame('/:id', (c) => {
  const index = Number(c.req.param('id'));
  const collectionName = collectionNames[(index%collectionNames.length)];
  const artistName = artistNames[(index%collectionNames.length)]; 
  return c.res({
    title,
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
            backgroundPosition: 'top center',
            height: "100%",
            width:"100%",
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
      <Button action={`/${index===0?(collectionNames.length-1):(((index-1)%collectionNames.length))}`}>⬅️</Button>,
      <Button action={`/${((index+1)%collectionNames.length)}`}>➡️</Button>, 
      <Button action='/'>Pick! ✅</Button>, 
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})