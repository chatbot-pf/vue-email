const digitToNameMap = {
  0: 'zero',
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
} as const

/**
 * Replaces special characters to avoid problems on email clients.
 *
 * @param className - This should not come with any escaped characters, it should come the same
 * as is on the `className` attribute on Vue elements.
 */
const LEADING_DIGIT_REGEX = /^\d/
const SPECIAL_CHARS_REGEX = /[^\w-]/g

export function sanitizeClassName(className: string) {
  return className
    .replaceAll('+', 'plus')
    .replaceAll('[', '')
    .replaceAll('%', 'pc')
    .replaceAll(']', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('!', 'imprtnt')
    .replaceAll('>', 'gt')
    .replaceAll('<', 'lt')
    .replaceAll('=', 'eq')
    .replace(LEADING_DIGIT_REGEX, (digit) => {
      return digitToNameMap[digit as keyof typeof digitToNameMap]
    })
    .replace(SPECIAL_CHARS_REGEX, '_')
}
