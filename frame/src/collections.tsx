import { Button, Frog } from 'frog';

const title = 'edpon collections';

export const collectionsApp = new Frog({
  title,
  assetsPath: '/',
  basePath: '/',
})

collectionsApp.frame('/', (c) => {
  return c.res({
    title,
    image: '/insert-token.gif',
    imageAspectRatio: '1:1',
    intents: [
      <Button action='/'>⬅️</Button>,
      <Button action='/'>➡️</Button>, 
      <Button action='/'>Pick! ✅</Button>, 
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})