import { Button, Frog } from 'frog';
import { Box, Heading, Text, VStack, Image, vars } from "./ui.js";

const title = 'edpon collections';

export const collectionsApp = new Frog({
  title,
  assetsPath: '/',
  basePath: '/',
  ui: { vars },
})

collectionsApp.frame('/', (c) => {
  return c.res({
    title,
    image: (
        <div
          style={{
            color: 'green',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: "url(https://i.imgur.com/IcfnuQ0.png)",
            fontSize: 60,
            backgroundSize: "cover",
            // backgroundWidth:"100%",
            backgroundPosition: "top center",
            height: "100%",
            width:"100%",
            backgroundRepeat: 'no-repeat',
          }}
        >
          <p style={{
            margin: 0,
          }}>Collection Name</p>
          <p style={{
            color: 'white',
            fontSize: 30,
            margin: 0,
          }}
          >Artist Name</p>
      </div>
    ),
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>⬅️</Button>,
      <Button action='/'>➡️</Button>, 
      <Button action='/'>Pick! ✅</Button>, 
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})