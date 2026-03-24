import { expect, it } from 'vitest'
import { sanitizeClassName } from './sanitize-class-name'

it('sanitizeClassName', () => {
  expect(sanitizeClassName('min-height-[calc(25px+100%-20%*2/4)]')).toBe(
    'min-height-calc25pxplus100pc-20pc_2_4',
  )
})
