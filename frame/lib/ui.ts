import { createSystem } from 'frog/ui'
 
export const {Box, Heading, Text, VStack, Image, vars } = createSystem({
    fonts: {
        default: [
          {
            name: 'Pixelify Sans',
            source: 'google',
            weight: 400,
            letterSpacing: '1px', 
          },
        ],
}
})