import { createSystem } from 'frog/ui'
 
export const {Box, Heading, Text, VStack, Image, vars } = createSystem({
    fonts: {
        default: [
          {
            name: 'DotGothic16',
            source: 'google',
            weight: 400,
          },
        ],
}
})