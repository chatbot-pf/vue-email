import { describe, expect, it } from 'vitest'
import { setupTailwind } from './setup-tailwind'

describe('setupTailwind', () => {
  it('returns an object with addUtilities and getStyleSheet', async () => {
    const tailwind = await setupTailwind({})
    expect(typeof tailwind.addUtilities).toBe('function')
    expect(typeof tailwind.getStyleSheet).toBe('function')
  })

  it('getStyleSheet returns a css-tree StyleSheet', async () => {
    const tailwind = await setupTailwind({})
    const styleSheet = tailwind.getStyleSheet()
    expect(styleSheet.type).toBe('StyleSheet')
  })

  it('addUtilities builds CSS for the given class names', async () => {
    const tailwind = await setupTailwind({})
    tailwind.addUtilities(['bg-red-500', 'text-white'])
    const styleSheet = tailwind.getStyleSheet()
    expect(styleSheet.type).toBe('StyleSheet')
  })

  it('accepts tailwind config', async () => {
    const tailwind = await setupTailwind({
      theme: {
        extend: {
          colors: {
            brand: '#ff0000',
          },
        },
      },
    })
    tailwind.addUtilities(['bg-brand'])
    const styleSheet = tailwind.getStyleSheet()
    expect(styleSheet.type).toBe('StyleSheet')
  })
})
