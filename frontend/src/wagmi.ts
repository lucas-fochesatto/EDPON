import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  zora,
  zoraSepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    zora,
    zoraSepolia,
  ],
  ssr: true,
});