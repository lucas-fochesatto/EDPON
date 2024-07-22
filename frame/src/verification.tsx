import { Button, Frog } from 'frog';
import { getFarcasterUserInfo } from '../lib/neynar';

const title = 'edpon verification';

export const verificationsApp = new Frog({
  title,
  assetsPath: '/',
  basePath: '/',
})

verificationsApp.frame('/', async (c) => {
  // 397059
  // c.frameData?.fid
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
          <Button action="/">Back</Button>,
          <Button.Reset>Reset</Button.Reset>,
        ],
      });
    }
  }
  
  return c.res({
    headers: {
      'cache-control': 'max-age=0',
    },
    title,
    image: '/errorImg.jpeg',
    imageAspectRatio: '1:1',
    intents: [
      <Button action="/">a</Button>,
      <Button.Reset>RESET</Button.Reset>,
    ],
  });
});