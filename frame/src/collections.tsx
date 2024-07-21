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
      <Button action='/'>goo bbd</Button>, //so this goes to this page
      <Button.Reset>reset settre</Button.Reset>,
    ],
  })
})